import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/brand";
import { CredentialForm } from "@/components/credential-form";
import { signIn } from "./actions";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  const { next, reason } = await searchParams;
  return (
    <main className="grid min-h-dvh place-items-center bg-muted/40 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Brand />
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-xs">
          <h1 className="text-base font-semibold">Sign in to your application</h1>
          <p className="mt-1 mb-5 text-sm text-muted-foreground">
            Use an API key for the application whose webhooks you want to manage.
          </p>
          <CredentialForm
            action={signIn}
            name="apiKey"
            label="API key"
            placeholder="hr_live_…"
            next={typeof next === "string" ? next : undefined}
            notice={reason === "expired" ? "Your key stopped working. It may have been revoked. Sign in with another key." : undefined}
            hint="The key stays on the server. Your browser only holds an encrypted session."
          />
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have a key?{" "}
          <Link href="/admin" className="font-medium text-foreground underline-offset-4 hover:underline">
            Create one in the admin area
          </Link>
        </p>
      </div>
    </main>
  );
}
