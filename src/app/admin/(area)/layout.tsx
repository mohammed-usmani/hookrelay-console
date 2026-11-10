import { Boxes } from "lucide-react";
import { redirect } from "next/navigation";
import { AccountMenu } from "@/components/account-menu";
import { Shell } from "@/components/shell";
import { readSession } from "@/lib/session";
import { adminSignOut } from "../actions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await readSession("admin"))) redirect("/admin/sign-in");
  return (
    <Shell
      home="/admin"
      suffix="Admin"
      items={[{ href: "/admin", label: "Applications", icon: <Boxes /> }]}
      footer={<AccountMenu identity="Operator" detail="Admin token" signOut={adminSignOut} switchTo={{ href: "/", label: "Application console" }} />}
    >
      {children}
    </Shell>
  );
}
