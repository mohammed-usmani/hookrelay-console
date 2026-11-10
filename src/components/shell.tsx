import Link from "next/link";
import { Brand } from "./brand";
import { Nav, type NavItem } from "./nav";

export function Shell({
  home,
  suffix,
  items,
  footer,
  children,
}: {
  home: string;
  suffix?: string;
  items: NavItem[];
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh md:grid md:grid-cols-[15rem_1fr]">
      <aside className="flex flex-col gap-4 border-b bg-sidebar px-3 py-3 md:sticky md:top-0 md:h-dvh md:border-r md:border-b-0 md:py-4">
        <Link href={home} className="px-2 py-1">
          <Brand suffix={suffix} />
        </Link>
        <div className="-mx-3 overflow-x-auto px-3 md:mx-0 md:flex-1 md:overflow-visible md:px-0">
          <Nav items={items} />
        </div>
        <div className="hidden md:block">{footer}</div>
      </aside>
      <main id="main" className="min-w-0 px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-6xl">{children}</div>
        <div className="mt-10 border-t pt-4 md:hidden">{footer}</div>
      </main>
    </div>
  );
}
