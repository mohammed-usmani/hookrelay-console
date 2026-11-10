export type Page<T> = { data: T[]; nextCursor: string | null };

export type EndpointStatus = "ACTIVE" | "PAUSED" | "DISABLED";
export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";
export type DeliveryStatus = "PENDING" | "FAILED_RETRYING" | "SUCCEEDED" | "DEAD";
export type AttemptOutcome =
  | "SUCCESS"
  | "HTTP_ERROR"
  | "REDIRECT"
  | "TIMEOUT"
  | "CONNECTION_ERROR"
  | "TLS_ERROR"
  | "SSRF_BLOCKED";

export type Endpoint = {
  id: string;
  url: string;
  description: string | null;
  eventTypes: string[];
  status: EndpointStatus;
  rateLimitPerSec: number | null;
  circuitState: CircuitState;
  createdAt: string;
  updatedAt: string;
};

export type EndpointStats = {
  window: string;
  attempts: number;
  successes: number;
  successRate: number | null;
  p50Ms: number | null;
  p95Ms: number | null;
  deliveriesByStatus: Record<DeliveryStatus, number>;
  circuitState: CircuitState;
  lastSuccessAt: string | null;
};

export type EventType = {
  name: string;
  description: string | null;
  schema: unknown | null;
  system: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Event = {
  id: string;
  eventType: string;
  payload?: unknown;
  payloadPurged: boolean;
  createdAt: string;
};

export type Delivery = {
  id: string;
  eventId: string;
  endpointId: string;
  status: DeliveryStatus;
  deadReason: string | null;
  attemptCount: number;
  nextAttemptAt: string | null;
  deadlineAt: string;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Attempt = {
  id: string;
  attemptNo: number;
  startedAt: string;
  durationMs: number;
  responseStatus: number | null;
  responseSnippet: string | null;
  outcome: AttemptOutcome;
  error: string | null;
};

export type Application = {
  id: string;
  name: string;
  status: "ACTIVE" | "DISABLED";
  createdAt: string;
  updatedAt: string;
};

export type ApiKey = {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
};

/** RFC 9457 problem detail, as every HookRelay error is returned. */
export type Problem = {
  type?: string;
  title?: string;
  status: number;
  detail?: string;
  errors?: { field?: string; message?: string; path?: string }[];
};
