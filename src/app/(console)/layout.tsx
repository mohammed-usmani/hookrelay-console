import { Braces, Gauge, Inbox, SendHorizontal, Webhook } from "lucide-react";
import { redirect } from "next/navigation";
import { AccountMenu } from "@/components/account-menu";
import { Shell } from "@/components/shell";
import { readSession } from "@/lib/session";
import { signOut } from "./actions";

const ITEMS = [
  { href: "/", label: "Overview", icon: <Gauge /> },
  { href: "/endpoints", label: "Endpoints", icon: <Webhook /> },
  { href: "/events", label: "Events", icon: <Inbox /> },
  { href: "/deliveries", label: "Deliveries", icon: <SendHorizontal /> },
  { href: "/event-types", label: "Event types", icon: <Braces /> },
];

export default async function ConsoleLayout({ children }: LayoutProps<"/">) {
  const session = await readSession("app");
  if (!session) redirect("/sign-in");
  const prefix = session.apiKey.split("_")[2];
  return (
    <Shell
      home="/"
      items={ITEMS}
      footer={
        <AccountMenu
          identity="Signed in with API key"
          detail={`hr_live_${prefix}…`}
          signOut={signOut}
          switchTo={{ href: "/admin", label: "Admin area" }}
        />
      }
    >
      {children}
    </Shell>
  );
}
