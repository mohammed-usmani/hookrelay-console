import { cn } from "@/lib/utils";
import type { CircuitState, DeliveryStatus, EndpointStatus } from "@/lib/types";

type Tone = "ok" | "warn" | "bad" | "idle" | "info";

const TONE: Record<Tone, string> = {
  ok: "text-ok bg-ok/10 ring-ok/20",
  warn: "text-warn bg-warn/10 ring-warn/25",
  bad: "text-bad bg-bad/10 ring-bad/20",
  idle: "text-muted-foreground bg-muted ring-border",
  info: "text-primary bg-primary/8 ring-primary/20",
};

export function Pill({ tone, children, className }: { tone: Tone; children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center gap-1.5 rounded-full px-2 text-xs font-medium whitespace-nowrap ring-1 ring-inset",
        TONE[tone],
        className,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

const DELIVERY: Record<DeliveryStatus, [Tone, string]> = {
  PENDING: ["info", "Pending"],
  FAILED_RETRYING: ["warn", "Retrying"],
  SUCCEEDED: ["ok", "Delivered"],
  DEAD: ["bad", "Failed"],
};
export function DeliveryStatusPill({ status }: { status: DeliveryStatus }) {
  const [tone, label] = DELIVERY[status];
  return <Pill tone={tone}>{label}</Pill>;
}
export const DELIVERY_LABELS = Object.fromEntries(Object.entries(DELIVERY).map(([k, [, l]]) => [k, l])) as Record<
  DeliveryStatus,
  string
>;

const ENDPOINT: Record<EndpointStatus, [Tone, string]> = {
  ACTIVE: ["ok", "Active"],
  PAUSED: ["idle", "Paused"],
  DISABLED: ["bad", "Disabled"],
};
export function EndpointStatusPill({ status }: { status: EndpointStatus }) {
  const [tone, label] = ENDPOINT[status];
  return <Pill tone={tone}>{label}</Pill>;
}

const CIRCUIT: Record<CircuitState, [Tone, string, string]> = {
  CLOSED: ["ok", "Healthy", "Deliveries are flowing normally."],
  OPEN: ["bad", "Failing", "Too many consecutive failures. Deliveries are held and retried after a cool-down."],
  HALF_OPEN: ["warn", "Recovering", "A single test delivery is checking whether the endpoint is back."],
};
export function CircuitPill({ state }: { state: CircuitState }) {
  const [tone, label, help] = CIRCUIT[state];
  return (
    <span title={help}>
      <Pill tone={tone}>{label}</Pill>
    </span>
  );
}
export function circuitHelp(state: CircuitState) {
  return CIRCUIT[state][2];
}
