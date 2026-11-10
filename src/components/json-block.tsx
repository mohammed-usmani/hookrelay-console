import { CopyButton } from "./copy-button";

export function JsonBlock({ value }: { value: unknown }) {
  const text = JSON.stringify(value, null, 2);
  return (
    <div className="relative rounded-lg border bg-muted/30">
      <div className="absolute top-1.5 right-1.5">
        <CopyButton value={text} label="Copy JSON" />
      </div>
      <pre className="max-h-[32rem] overflow-auto p-4 pr-10 font-mono text-[0.8rem] leading-relaxed">{text}</pre>
    </div>
  );
}
