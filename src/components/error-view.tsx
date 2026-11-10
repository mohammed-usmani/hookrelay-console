"use client";

import { RotateCw, ServerCrash } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorView({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-dashed px-6 py-16 text-center">
      <ServerCrash className="mb-3 size-5 text-bad" />
      <p className="text-sm font-medium">This page couldn&apos;t be loaded</p>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        {process.env.NODE_ENV === "development" ? error.message : "The HookRelay API returned an error or could not be reached."}
        {error.digest && <span className="mt-2 block font-mono text-xs">Reference {error.digest}</span>}
      </p>
      <Button variant="outline" className="mt-4" onClick={reset}>
        <RotateCw /> Try again
      </Button>
    </div>
  );
}
