import "server-only";
import { cache } from "react";
import { api } from "./api";
import type { Endpoint, EventType, Page } from "./types";

// ponytail: loads up to 100 endpoints for name lookups; page through if an app ever has more
export const allEndpoints = cache(async () => {
  const page = await api<Page<Endpoint>>("/v1/endpoints", { query: { limit: 100 } });
  return page.data;
});

export const endpointMap = cache(async () => new Map((await allEndpoints()).map((e) => [e.id, e])));

export const allEventTypes = cache(async () => {
  const page = await api<Page<EventType>>("/v1/event-types", { query: { limit: 100 } });
  return page.data;
});
