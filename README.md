# HookRelay Console

Web console for [HookRelay](https://github.com/mohammed-usmani/hookrelay), a multi-tenant webhook delivery service. Use it to manage endpoints and event types, send events, and find out why a delivery failed.

## What it does

- **Overview**: delivery health over the last 24 hours, endpoints that need attention, and recent failures. A new application gets a setup checklist instead.
- **Endpoints**:
  - Add, edit, pause, resume and delete endpoints.
  - Send a test event.
  - Replay failed deliveries since a chosen time.
  - Reveal or rotate the signing secret.
  - 24-hour stats: success rate, p50 and p95 latency, deliveries by status.
- **Deliveries**:
  - Filter by status, endpoint and time.
  - Each delivery shows every attempt on a retry timeline. The timeline's axis is logarithmic, so retries seconds apart and hours apart both stay readable.
  - Each attempt shows the receiver's response body and the error.
  - Send a failed delivery again.
- **Events**: browse and filter events, view a payload and where it was delivered, and send an event by hand with an optional idempotency key.
- **Event types**: create types with an optional JSON Schema, edit them, and archive or restore them. HookRelay's own notification types are listed separately.
- **Admin area**: create applications, rename or disable them, and create or revoke API keys. A new key is shown once.

## How it works

The browser never talks to the HookRelay API directly. Next.js server components and server actions call the API (a backend-for-frontend), so:

- The API key or admin token lives in an **encrypted, httpOnly cookie** (JWE, A256GCM). Browser JavaScript can't read it, and the backend needs no CORS rules.
- Every mutation is a server action. When the key is revoked or expires, the next request sends you back to sign in.
- API errors come back as RFC 9457 problem details and are shown next to the form that caused them, field errors included.

Stack: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, shadcn/ui on Base UI, Lucide icons, `jose`.

## Running it

Start the HookRelay stack first (see its README). The API listens on `localhost:8080`, and Grafana from that stack uses port 3000, so the console runs on port **3100**.

```bash
cp .env.example .env.local
# set SESSION_SECRET: openssl rand -base64 32
npm install
npm run dev        # http://localhost:3100
```

To sign in:

1. Open `/admin` and sign in with `HOOKRELAY_ADMIN_TOKEN` (`demo-admin-token-change-me` in the demo `.env`).
2. Create an application and an API key for it.
3. Sign in at `/sign-in` with that key.

| Variable | Purpose |
| --- | --- |
| `HOOKRELAY_API_URL` | Base URL of the HookRelay API, read on the server only. Default `http://localhost:8080`. |
| `SESSION_SECRET` | At least 32 characters. Encrypts the session cookie. |

Checks: `npm run lint`, `npm run typecheck`, `npm run build`.
