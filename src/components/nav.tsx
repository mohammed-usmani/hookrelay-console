"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type NavItem = { href: string; label: string; icon: React.ReactNode };

export function Nav({ items }: { items: NavItem[] }) {
  const path = usePathname();
  return (
    <nav aria-label="Main" className="flex gap-0.5 md:flex-col">
      {items.map((i) => {
        const active = i.href === "/" || i.href === "/admin" ? path === i.href : path.startsWith(i.href);
        return (
          <Link
            key={i.href}
            href={i.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex h-8 shrink-0 items-center gap-2.5 rounded-md px-2.5 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground [&_svg]:size-4 [&_svg]:text-muted-foreground",
              active && "bg-sidebar-accent font-medium text-sidebar-accent-foreground [&_svg]:text-sidebar-primary",
            )}
          >
            {i.icon}
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}
