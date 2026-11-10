"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={label}
            onClick={async () => {
              await navigator.clipboard.writeText(value);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
          />
        }
      >
        {copied ? <Check className="text-ok" /> : <Copy />}
      </TooltipTrigger>
      <TooltipContent>{copied ? "Copied" : label}</TooltipContent>
    </Tooltip>
  );
}

/** An identifier shown in mono, shortened, with a copy button for the full value. */
export function Id({ value, full = false }: { value: string; full?: boolean }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      <span className="font-mono text-[0.8rem]" title={value}>
        {full ? value : value.slice(0, 8)}
      </span>
      <CopyButton value={value} label="Copy ID" />
    </span>
  );
}
