import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./auth";
import { db } from "./db";

/**
 * Use at the top of every admin server action.
 *
 * Server actions are public POST endpoints, so the admin layout's check is
 * not enough on its own. This re-verifies the session AND re-reads the role
 * from the database (so a demoted admin loses access immediately, even with
 * a still-valid session token), and returns the acting user's id for audit
 * logging and message authorship.
 */
export async function requireAdminActor(): Promise<{ userId: string }> {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  const email = session?.user?.email;

  if (!session || role !== "ADMIN" || !email) {
    redirect("/portal/sign-in");
  }

  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, role: true },
  });

  if (!user || user.role !== "ADMIN") {
    redirect("/portal/sign-in");
  }

  return { userId: user.id };
}
