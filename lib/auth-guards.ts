import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./auth";

/**
 * Every customer-portal and admin page should call one of these at the top
 * of the server component, and use the returned session — never a value
 * from route params or a form field — to decide what data to load.
 */

export async function requireCustomerSession() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session || (role !== "CUSTOMER" && role !== "ADMIN")) {
    redirect("/portal/sign-in");
  }
  return session;
}

export async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session || role !== "ADMIN") {
    redirect("/portal/sign-in");
  }
  return session;
}
