export type Result<T = undefined> = { ok: true; message?: string; data?: T } | { ok: false; error: string };
export type FormState<T = undefined> = (Result<T> & { at: number }) | undefined;
