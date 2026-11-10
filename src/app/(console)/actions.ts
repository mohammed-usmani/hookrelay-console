"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api, describe } from "@/lib/api";
import type { FormState, Result } from "@/lib/action";
import { endSession } from "@/lib/session";
import type { Delivery, Endpoint } from "@/lib/types";

const now = () => Date.now();
const str = (fd: FormData, k: string) => {
  const v = fd.get(k);
  return typeof v === "string" ? v.trim() : "";
};

function parseJson(raw: string, what: string): { ok: true; value: unknown } | { ok: false; error: string } {
  try {
    return { ok: true, value: JSON.parse(raw) };
  } catch (e) {
    return { ok: false, error: `${what} is not valid JSON: ${(e as Error).message}` };
  }
}

export async function signOut() {
  await endSession("app");
  redirect("/sign-in");
}

/* Endpoints */

function endpointBody(fd: FormData, editing: boolean) {
  const rate = str(fd, "rateLimitPerSec");
  return {
    url: str(fd, "url"),
    description: str(fd, "description"),
    eventTypes: fd.getAll("eventTypes").map(String),
    // on edit an empty field removes the limit (0); on create it is simply absent
    rateLimitPerSec: rate ? Number(rate) : editing ? 0 : undefined,
  };
}

export async function createEndpoint(_: FormState, fd: FormData): Promise<FormState> {
  let created: Endpoint;
  try {
    created = await api<Endpoint>("/v1/endpoints", { method: "POST", body: endpointBody(fd, false) });
  } catch (e) {
    return { ok: false, error: describe(e), at: now() };
  }
  revalidatePath("/endpoints");
  redirect(`/endpoints/${created.id}?created=1`);
}

export async function updateEndpoint(id: string, _: FormState, fd: FormData): Promise<FormState> {
  try {
    await api(`/v1/endpoints/${id}`, { method: "PATCH", body: endpointBody(fd, true) });
  } catch (e) {
    return { ok: false, error: describe(e), at: now() };
  }
  revalidatePath(`/endpoints/${id}`);
  return { ok: true, message: "Endpoint saved", at: now() };
}

export async function pauseEndpoint(id: string): Promise<Result> {
  return run(() => api(`/v1/endpoints/${id}/pause`, { method: "POST" }), `/endpoints/${id}`, "Endpoint paused");
}

export async function resumeEndpoint(id: string): Promise<Result> {
  return run(() => api(`/v1/endpoints/${id}/resume`, { method: "POST" }), `/endpoints/${id}`, "Endpoint resumed");
}

export async function deleteEndpoint(id: string): Promise<Result> {
  try {
    await api(`/v1/endpoints/${id}`, { method: "DELETE" });
  } catch (e) {
    return { ok: false, error: describe(e) };
  }
  revalidatePath("/endpoints");
  redirect("/endpoints?deleted=1");
}

export async function revealSecret(id: string): Promise<Result<string>> {
  try {
    const { secret } = await api<{ secret: string }>(`/v1/endpoints/${id}/secret`);
    return { ok: true, data: secret };
  } catch (e) {
    return { ok: false, error: describe(e) };
  }
}

export async function rotateSecret(id: string): Promise<Result<string>> {
  try {
    const { secret } = await api<{ secret: string }>(`/v1/endpoints/${id}/rotate-secret`, { method: "POST" });
    return { ok: true, data: secret, message: "Secret rotated. The previous one keeps working for 24 hours." };
  } catch (e) {
    return { ok: false, error: describe(e) };
  }
}

export async function sendTest(id: string): Promise<Result<string>> {
  try {
    const sent = await api<{ eventId: string; deliveryId: string }>(`/v1/endpoints/${id}/test`, { method: "POST" });
    revalidatePath(`/endpoints/${id}`);
    return { ok: true, data: sent.deliveryId };
  } catch (e) {
    return { ok: false, error: describe(e) };
  }
}

export async function replayEndpoint(
  id: string,
  _: FormState<{ replayed: number; skippedPurged: number }>,
  fd: FormData,
): Promise<FormState<{ replayed: number; skippedPurged: number }>> {
  const local = str(fd, "since");
  const since = local ? new Date(local) : null;
  if (!since || Number.isNaN(since.getTime())) return { ok: false, error: "Choose a start time.", at: now() };
  try {
    const r = await api<{ replayed: number; skippedPurged: number }>(`/v1/endpoints/${id}/replay`, {
      method: "POST",
      body: { since: since.toISOString() },
    });
    revalidatePath(`/endpoints/${id}`);
    const skipped = r.skippedPurged ? `, ${r.skippedPurged} skipped because their payload was removed` : "";
    return { ok: true, data: r, message: `${r.replayed} failed ${r.replayed === 1 ? "delivery" : "deliveries"} queued again${skipped}`, at: now() };
  } catch (e) {
    return { ok: false, error: describe(e), at: now() };
  }
}

/* Event types */

function eventTypeBody(fd: FormData, withName: boolean): { ok: true; body: object } | { ok: false; error: string } {
  const schemaRaw = str(fd, "schema");
  let schema: unknown = undefined;
  if (schemaRaw) {
    const parsed = parseJson(schemaRaw, "Schema");
    if (!parsed.ok) return parsed;
    schema = parsed.value;
  }
  return {
    ok: true,
    body: { ...(withName ? { name: str(fd, "name") } : {}), description: str(fd, "description"), schema },
  };
}

export async function createEventType(_: FormState, fd: FormData): Promise<FormState> {
  const b = eventTypeBody(fd, true);
  if (!b.ok) return { ...b, at: now() };
  try {
    await api("/v1/event-types", { method: "POST", body: b.body });
  } catch (e) {
    return { ok: false, error: describe(e), at: now() };
  }
  revalidatePath("/event-types");
  return { ok: true, message: "Event type created", at: now() };
}

export async function updateEventType(name: string, _: FormState, fd: FormData): Promise<FormState> {
  const b = eventTypeBody(fd, false);
  if (!b.ok) return { ...b, at: now() };
  try {
    await api(`/v1/event-types/${encodeURIComponent(name)}`, { method: "PATCH", body: b.body });
  } catch (e) {
    return { ok: false, error: describe(e), at: now() };
  }
  revalidatePath("/event-types");
  return { ok: true, message: "Event type saved", at: now() };
}

export async function setEventTypeArchived(name: string, archived: boolean): Promise<Result> {
  return run(
    () => api(`/v1/event-types/${encodeURIComponent(name)}/${archived ? "archive" : "unarchive"}`, { method: "POST" }),
    "/event-types",
    archived ? `${name} archived` : `${name} restored`,
  );
}

/* Events and deliveries */

export async function sendEvent(_: FormState<string>, fd: FormData): Promise<FormState<string>> {
  const payload = parseJson(str(fd, "payload") || "{}", "Payload");
  if (!payload.ok) return { ...payload, at: now() };
  const key = str(fd, "idempotencyKey");
  let res: { id: string; deliveryCount: number };
  try {
    res = await api("/v1/events", {
      method: "POST",
      body: { eventType: str(fd, "eventType"), payload: payload.value },
      headers: key ? { "Idempotency-Key": key } : undefined,
    });
  } catch (e) {
    return { ok: false, error: describe(e), at: now() };
  }
  revalidatePath("/events");
  redirect(`/events/${res.id}`);
}

export async function replayDelivery(id: string): Promise<Result> {
  return run(() => api<Delivery>(`/v1/deliveries/${id}/replay`, { method: "POST" }), `/deliveries/${id}`, "Delivery queued again");
}

async function run(fn: () => Promise<unknown>, path: string, message: string): Promise<Result> {
  try {
    await fn();
  } catch (e) {
    return { ok: false, error: describe(e) };
  }
  revalidatePath(path);
  return { ok: true, message };
}
