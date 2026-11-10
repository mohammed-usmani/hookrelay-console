"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useActionState, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { FormState } from "@/lib/action";
import { cn } from "@/lib/utils";

/** A form in a dialog, backed by a server action. Closes and toasts on success; keeps input on error. */
export function FormDialog<T>({
  trigger,
  title,
  description,
  submit,
  action,
  children,
  wide,
  onSuccess,
}: {
  trigger: React.ReactElement;
  title: string;
  description?: React.ReactNode;
  submit: string;
  action: (s: FormState<T>, fd: FormData) => Promise<FormState<T>>;
  children: React.ReactNode;
  wide?: boolean;
  onSuccess?: (data: T | undefined) => void;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(async (prev: FormState<T>, fd: FormData) => {
    const next = await action(prev, fd);
    if (next?.ok) {
      setOpen(false);
      if (next.message) toast.success(next.message);
      onSuccess?.(next.data);
    }
    return next;
  }, undefined);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className={cn("max-h-[90dvh] overflow-y-auto", wide ? "sm:max-w-xl" : "sm:max-w-md")}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <form action={formAction} className="space-y-5">
          {children}
          {state && !state.ok && (
            <p role="alert" className="flex items-start gap-2 rounded-md bg-bad/8 px-3 py-2 text-sm text-bad">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              {state.error}
            </p>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>Cancel</DialogClose>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="animate-spin" />}
              {submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  optional,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: React.ReactNode;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="flex items-baseline gap-1.5 text-sm font-medium">
        {label}
        {optional && <span className="text-xs font-normal text-muted-foreground">Optional</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";
