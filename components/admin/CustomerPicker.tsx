import Link from "next/link";

type PickerHousehold = {
  id: string;
  users: { name: string; email: string }[];
  plan: { name: string } | null;
};

/** Step 1 of the add-device / log-ticket flows: choose the customer. */
export default function CustomerPicker({
  basePath,
  households,
}: {
  basePath: string;
  households: PickerHousehold[];
}) {
  if (households.length === 0) {
    return <p className="mt-6 text-ink/60">No customers yet.</p>;
  }

  return (
    <ul className="mt-6 overflow-hidden rounded-xl2 border border-mist bg-white">
      {households.map((h) => (
        <li key={h.id} className="border-b border-mist last:border-0">
          <Link
            href={`${basePath}?householdId=${encodeURIComponent(h.id)}`}
            className="flex items-center justify-between px-4 py-3 hover:bg-mist/20"
          >
            <span className="font-semibold text-ink">{h.users[0]?.name ?? "(no primary user)"}</span>
            <span className="text-sm text-ink/60">
              {h.users[0]?.email ?? ""}
              {h.plan ? ` · ${h.plan.name}` : ""}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
