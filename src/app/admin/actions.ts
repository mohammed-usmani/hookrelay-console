"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminApi, describe } from "@/lib/api";
import type { FormState, Result } from "@/lib/action";
import { endSession } from "@/lib/session";
import type { Application } from "@/lib/types";

const now = () => Date.now();
const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

export async function adminSignOut() {
  await endSession("admin");
  redirect("/admin/sign-in");
}

export async function createApplication(_: FormState, fd: FormData): Promise<FormState> {
  let app: Application;
  try {
    app = await adminApi<Application>("/v1/admin/applications", { method: "POST", body: { name: str(fd, "name") } });
  } catch (e) {
    return { ok: false, error: describe(e), at: now() };
  }
  revalidatePath("/admin");
  redirect(`/admin/applications/${app.id}`);
}

export async function renameApplication(id: string, _: FormState, fd: FormData): Promise<FormState> {
  try {
    await adminApi(`/v1/admin/applications/${id}`, { method: "PATCH", body: { name: str(fd, "name") } });
  } catch (e) {
    return { ok: false, error: describe(e), at: now() };
  }
  revalidatePath(`/admin/applications/${id}`);
  return { ok: true, message: "Application renamed", at: now() };
}

export async function setApplicationStatus(id: string, status: Application["status"]): Promise<Result> {
  try {
    await adminApi(`/v1/admin/applications/${id}`, { method: "PATCH", body: { status } });
  } catch (e) {
    return { ok: false, error: describe(e) };
  }
  revalidatePath(`/admin/applications/${id}`);
  return { ok: true, message: status === "DISABLED" ? "Application disabled" : "Application enabled" };
}

export async function createApiKey(appId: string, _: FormState<string>, fd: FormData): Promise<FormState<string>> {
  try {
    const k = await adminApi<{ key: string }>(`/v1/admin/applications/${appId}/api-keys`, { method: "POST", body: { name: str(fd, "name") } });
    revalidatePath(`/admin/applications/${appId}`);
    return { ok: true, data: k.key, at: now() };
  } catch (e) {
    return { ok: false, error: describe(e), at: now() };
  }
}

export async function revokeApiKey(appId: string, keyId: string): Promise<Result> {
  try {
    await adminApi(`/v1/admin/applications/${appId}/api-keys/${keyId}`, { method: "DELETE" });
  } catch (e) {
    return { ok: false, error: describe(e) };
  }
  revalidatePath(`/admin/applications/${appId}`);
  return { ok: true, message: "API key revoked" };
}
