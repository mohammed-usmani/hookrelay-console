import "server-only";
import { EncryptJWT, jwtDecrypt } from "jose";
import { cookies } from "next/headers";
import { SESSION_COOKIES as COOKIE } from "./session-cookies";

/**
 * The console never hands credentials to the browser: the API key (or admin token) lives in an
 * encrypted, httpOnly cookie and is only read by server code that calls the HookRelay API.
 */
export type Session = { kind: "app"; apiKey: string } | { kind: "admin"; adminToken: string };

const MAX_AGE_S = 12 * 60 * 60;

let key: Uint8Array | undefined;
async function secret(): Promise<Uint8Array> {
  if (!key) {
    const raw = process.env.SESSION_SECRET;
    if (!raw || raw.length < 32) {
      throw new Error("SESSION_SECRET must be set to at least 32 characters");
    }
    key = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw)));
  }
  return key;
}

export async function startSession(session: Session): Promise<void> {
  const token = await new EncryptJWT({ ...session })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_S}s`)
    .encrypt(await secret());
  (await cookies()).set(COOKIE[session.kind], token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_S,
  });
}

export async function readSession<K extends Session["kind"]>(kind: K): Promise<Extract<Session, { kind: K }> | null> {
  const token = (await cookies()).get(COOKIE[kind])?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtDecrypt(token, await secret());
    return payload.kind === kind ? (payload as unknown as Extract<Session, { kind: K }>) : null;
  } catch {
    return null;
  }
}

export async function endSession(kind: Session["kind"]): Promise<void> {
  (await cookies()).delete(COOKIE[kind]);
}
