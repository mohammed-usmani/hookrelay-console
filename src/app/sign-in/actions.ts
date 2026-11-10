"use server";

import { redirect } from "next/navigation";
import { probe } from "@/lib/api";
import type { FormState } from "@/lib/action";
import { startSession } from "@/lib/session";

const KEY = /^hr_live_[A-Za-z0-9]{8}_[A-Za-z0-9]{32}$/;

/** Only same-site paths, so a crafted link can't bounce a fresh session elsewhere. */
function safeNext(raw: FormDataEntryValue | null, fallback: string) {
  const v = typeof raw === "string" ? raw : "";
  return v.startsWith("/") && !v.startsWith("//") ? v : fallback;
}

export async function signIn(_: FormState, fd: FormData): Promise<FormState> {
  const apiKey = String(fd.get("apiKey") ?? "").trim();
  if (!KEY.test(apiKey)) {
    return { ok: false, error: "That doesn't look like a HookRelay API key. Keys start with hr_live_.", at: Date.now() };
  }
  const check = await probe(apiKey, "/v1/endpoints");
  if (check === "unauthorized") return { ok: false, error: "This key was not accepted. It may have been revoked.", at: Date.now() };
  if (check === "unreachable") return { ok: false, error: "Can't reach the HookRelay API. Check that the server is running.", at: Date.now() };
  await startSession({ kind: "app", apiKey });
  redirect(safeNext(fd.get("next"), "/"));
}

export async function adminSignIn(_: FormState, fd: FormData): Promise<FormState> {
  const adminToken = String(fd.get("adminToken") ?? "").trim();
  if (!adminToken) return { ok: false, error: "Enter the admin token.", at: Date.now() };
  const check = await probe(adminToken, "/v1/admin/applications");
  if (check === "unauthorized") return { ok: false, error: "This admin token was not accepted.", at: Date.now() };
  if (check === "unreachable") return { ok: false, error: "Can't reach the HookRelay API. Check that the server is running.", at: Date.now() };
  await startSession({ kind: "admin", adminToken });
  redirect(safeNext(fd.get("next"), "/admin"));
}
