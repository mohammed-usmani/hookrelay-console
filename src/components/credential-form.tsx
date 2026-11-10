"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FormState } from "@/lib/action";

export function CredentialForm({
  action,
  name,
  label,
  placeholder,
  hint,
  next,
  notice,
}: {
  action: (s: FormState, fd: FormData) => Promise<FormState>;
  name: string;
  label: string;
  placeholder: string;
  hint: React.ReactNode;
  next?: string;
  notice?: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const error = state && !state.ok ? state.error : notice;
  return (
    <form action={formAction} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      <div className="space-y-2">
        <Label htmlFor={name}>{label}</Label>
        <Input
          id={name}
          name={name}
          type="password"
          autoComplete="off"
          spellCheck={false}
          placeholder={placeholder}
          className="font-mono"
          required
          autoFocus
          aria-invalid={!!(state && !state.ok)}
          aria-describedby={`${name}-hint`}
        />
        <p id={`${name}-hint`} className="text-sm text-muted-foreground">
          {hint}
        </p>
      </div>
      {error && (
        <p role="alert" className="flex items-start gap-2 rounded-md bg-bad/8 px-3 py-2 text-sm text-bad">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}
      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending && <Loader2 className="animate-spin" />}
        Sign in
      </Button>
    </form>
  );
}
