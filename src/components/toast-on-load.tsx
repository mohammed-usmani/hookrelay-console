"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

/** Shows a toast after a redirect (e.g. "Endpoint deleted"), then drops the flag from the URL. */
export function Toast({ message }: { message: string }) {
  const router = useRouter();
  const path = usePathname();
  const sp = useSearchParams();
  useEffect(() => {
    toast.success(message);
    const q = new URLSearchParams(sp);
    ["deleted", "created"].forEach((k) => q.delete(k));
    router.replace(q.size ? `${path}?${q}` : path, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
