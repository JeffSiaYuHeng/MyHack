import { cn } from "@/lib/utils";

type StateBlockVariant = "empty" | "error" | "fallback" | "success" | "loading";

interface StateBlockProps {
  variant?: StateBlockVariant;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

const VARIANT_STYLE: Record<StateBlockVariant, { accent: string; label: string }> = {
  empty: { accent: "var(--muted-foreground)", label: "Empty" },
  error: { accent: "var(--status-critical)", label: "Error" },
  fallback: { accent: "var(--status-risk)", label: "Fallback" },
  success: { accent: "var(--status-healthy)", label: "Success" },
  loading: { accent: "var(--primary)", label: "Loading" },
};

export function StateBlock({
  variant = "empty",
  title,
  description,
  action,
  className,
}: StateBlockProps) {
  const style = VARIANT_STYLE[variant];

  return (
    <div className={cn("rounded-xl border border-border bg-card px-5 py-6 text-center", className)}>
      <span
        className="inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]"
        style={{ borderColor: style.accent, color: style.accent }}
      >
        {style.label}
      </span>
      <p className="mt-3 text-sm font-semibold text-foreground">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-muted-foreground">
        {description}
      </p>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
