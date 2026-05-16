import { cn } from "@/lib/utils";

interface AiOperationLoaderProps {
  title: string;
  description?: string;
  steps: string[];
  className?: string;
}

export function AiOperationLoader({
  title,
  description,
  steps,
  className,
}: AiOperationLoaderProps) {
  return (
    <div className={cn("border border-border rounded-xl bg-card px-4 py-4", className)}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 size-7 rounded-full border border-primary/30 border-t-primary animate-spin" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {steps.map((step, index) => (
          <div key={step} className="rounded-lg border border-border bg-muted/30 px-3 py-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-medium text-muted-foreground">
                {step}
              </span>
              <span className="text-[10px] text-muted-foreground/70">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <div
              className="mt-2 h-1.5 rounded-full overflow-hidden ai-loading-scan"
              style={{ animationDelay: `${index * 110}ms` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
