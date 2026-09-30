import { isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/shell";
export const dynamic = "force-dynamic";
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAdmin())) redirect("/admin/login");
  return <AdminShell>{children}</AdminShell>;
}
