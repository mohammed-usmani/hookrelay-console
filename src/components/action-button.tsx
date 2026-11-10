"use client";

import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { Result } from "@/lib/action";

type Confirm = { title: string; description: React.ReactNode; action: string; destructive?: boolean };

/**
 * Runs a server action: optional confirmation, a pending state, and a toast with the outcome.
 * The toast says what happened in the same words as the button.
 */
export function ActionButton<T>({
  action,
  confirm,
  onDone,
  children,
  ...button
}: {
  action: () => Promise<Result<T>>;
  confirm?: Confirm;
  onDone?: (data: T | undefined) => void;
  children: React.ReactNode;
} & Omit<React.ComponentProps<typeof Button>, "action" | "onClick">) {
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);

  const execute = () =>
    start(async () => {
      const r = await action();
      setOpen(false);
      if (!r) return; // redirected
      if (r.ok) {
        if (r.message) toast.success(r.message);
        onDone?.(r.data);
      } else {
        toast.error(r.error);
      }
    });

  return (
    <>
      <Button {...button} disabled={pending || button.disabled} onClick={confirm ? () => setOpen(true) : execute}>
        {pending && !confirm ? <Loader2 className="animate-spin" /> : null}
        {children}
      </Button>
      {confirm && (
        <AlertDialog open={open} onOpenChange={(o) => !pending && setOpen(o)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{confirm.title}</AlertDialogTitle>
              <AlertDialogDescription>{confirm.description}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
              <Button variant={confirm.destructive ? "destructive" : "default"} disabled={pending} onClick={execute}>
                {pending && <Loader2 className="animate-spin" />}
                {confirm.action}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
