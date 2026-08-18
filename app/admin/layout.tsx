import Link from "next/link";
import { requireAdminSession } from "@/lib/auth-guards";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminSession();

  return (
    <div className="mx-auto flex max-w-7xl gap-8 px-6 py-10">
      <aside className="w-56 flex-shrink-0">
        <p className="font-display text-xl font-semibold text-ink">Admin</p>
        <nav className="mt-6 flex flex-col gap-1">
          <Link href="/admin" className="rounded-lg px-3 py-2 text-ink/80 hover:bg-mist">
            Overview
          </Link>
          <Link href="/admin/customers" className="rounded-lg px-3 py-2 text-ink/80 hover:bg-mist">
            Customers
          </Link>
        </nav>
      </aside>
      <div className="flex-1">{children}</div>
    </div>
  );
}
