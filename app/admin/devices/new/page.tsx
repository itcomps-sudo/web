import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth-guards";
import CustomerPicker from "@/components/admin/CustomerPicker";
import DeviceForm from "@/components/admin/DeviceForm";

export default async function NewDevicePage({
  searchParams,
}: {
  searchParams: { householdId?: string; error?: string };
}) {
  await requireAdminSession();

  if (!searchParams.householdId) {
    const households = await db.household.findMany({
      include: { users: { take: 1, orderBy: { createdAt: "asc" } }, plan: true },
      orderBy: { createdAt: "desc" },
    });

    return (
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">Add device</h1>
        <p className="mt-2 text-ink/70">Which customer is this device for?</p>
        <CustomerPicker basePath="/admin/devices/new" households={households} />
      </div>
    );
  }

  const household = await db.household.findUnique({
    where: { id: searchParams.householdId },
    include: { users: { take: 1, orderBy: { createdAt: "asc" } } },
  });
  if (!household) notFound();

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink">Add device</h1>
      <div className="mt-6">
        <DeviceForm
          householdId={household.id}
          customerName={household.users[0]?.name ?? "(no primary user)"}
          error={searchParams.error}
        />
      </div>
    </div>
  );
}
