import "server-only";
import { redirect } from "next/navigation";
import { readSession } from "./session";
import type { Problem } from "./types";

const BASE = (process.env.HOOKRELAY_API_URL ?? "http://localhost:8080").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(readonly problem: Problem) {
    super(problem.detail ?? problem.title ?? `Request failed with ${problem.status}`);
  }
  get status() {
    return this.problem.status;
  }
}

type Init = { method?: string; body?: unknown; query?: Record<string, string | number | undefined | null>; headers?: Record<string, string> };

async function call<T>(token: string, path: string, init: Init = {}): Promise<T> {
  const url = new URL(BASE + path);
  for (const [k, v] of Object.entries(init.query ?? {})) {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
  }
  let res: Response;
  try {
    res = await fetch(url, {
      method: init.method ?? "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
      body: init.body === undefined ? undefined : typeof init.body === "string" ? init.body : JSON.stringify(init.body),
      cache: "no-store",
    });
  } catch {
    throw new ApiError({ status: 503, title: "HookRelay is unreachable", detail: `Could not connect to ${BASE}.` });
  }
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  const json = text ? JSON.parse(text) : undefined;
  if (!res.ok) {
    throw new ApiError({ status: res.status, ...(json ?? {}) });
  }
  return json as T;
}

/** Calls the API as the signed-in application. An expired or revoked key sends the user to sign in. */
export async function api<T>(path: string, init?: Init): Promise<T> {
  const session = await readSession("app");
  if (!session) redirect("/sign-in");
  try {
    return await call<T>(session.apiKey, path, init);
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) redirect("/sign-in?reason=expired");
    throw e;
  }
}

export async function adminApi<T>(path: string, init?: Init): Promise<T> {
  const session = await readSession("admin");
  if (!session) redirect("/admin/sign-in");
  try {
    return await call<T>(session.adminToken, path, init);
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) redirect("/admin/sign-in?reason=expired");
    throw e;
  }
}

/** For sign-in: checks a credential without a session. */
export async function probe(token: string, path: string): Promise<"ok" | "unauthorized" | "unreachable"> {
  try {
    await call(token, path, { query: { limit: 1 } });
    return "ok";
  } catch (e) {
    if (e instanceof ApiError && (e.status === 401 || e.status === 403)) return "unauthorized";
    return "unreachable";
  }
}

/** Turns an API failure into a message a person can act on. */
export function describe(e: unknown): string {
  if (e instanceof ApiError) {
    const fields = e.problem.errors?.map((x) => [x.field ?? x.path, x.message].filter(Boolean).join(": "));
    return fields?.length ? `${e.message} (${fields.join("; ")})` : e.message;
  }
  throw e; // redirects and programming errors must propagate
}
