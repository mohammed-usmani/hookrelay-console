import { SearchX } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center rounded-lg border border-dashed px-6 py-16 text-center">
      <SearchX className="mb-3 size-5 text-muted-foreground" />
      <p className="text-sm font-medium">Not found</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">It may have been deleted, or it belongs to another application.</p>
      <Link href="/admin" className={buttonVariants({ variant: "outline", className: "mt-4" })}>
        Back to applications
      </Link>
    </div>
  );
}
