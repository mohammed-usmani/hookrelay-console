import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/brand";
import { CredentialForm } from "@/components/credential-form";
import { adminSignIn } from "@/app/sign-in/actions";

export const metadata: Metadata = { title: "Admin sign in" };

export default async function AdminSignInPage({ searchParams }: PageProps<"/admin/sign-in">) {
  const { next, reason } = await searchParams;
  return (
    <main className="grid min-h-dvh place-items-center bg-muted/40 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Brand suffix="Admin" />
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-xs">
          <h1 className="text-base font-semibold">Sign in as operator</h1>
          <p className="mt-1 mb-5 text-sm text-muted-foreground">
            The admin area creates applications and their API keys.
          </p>
          <CredentialForm
            action={adminSignIn}
            name="adminToken"
            label="Admin token"
            placeholder="HOOKRELAY_ADMIN_TOKEN"
            next={typeof next === "string" ? next : undefined}
            notice={reason === "expired" ? "The admin token changed. Sign in again." : undefined}
            hint={<>The value of <code className="font-mono text-xs">HOOKRELAY_ADMIN_TOKEN</code> on the server.</>}
          />
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/sign-in" className="font-medium text-foreground underline-offset-4 hover:underline">
            Sign in with an API key instead
          </Link>
        </p>
      </div>
    </main>
  );
}
