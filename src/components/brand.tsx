import { Webhook } from "lucide-react";

export function Brand({ suffix }: { suffix?: string }) {
  return (
    <span className="inline-flex items-center gap-2 font-semibold tracking-tight">
      <span className="grid size-6 place-items-center rounded-md bg-primary text-primary-foreground">
        <Webhook className="size-3.5" strokeWidth={2.25} />
      </span>
      HookRelay
      {suffix && <span className="font-normal text-muted-foreground">{suffix}</span>}
    </span>
  );
}
