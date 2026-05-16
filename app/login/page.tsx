import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="w-full max-w-sm border border-border rounded-md bg-card p-8">
        <div className="mb-6">
          <span className="text-base font-semibold tracking-tight">Verrier</span>
          <p className="text-xs text-muted-foreground mt-0.5">
            Innovation programme management
          </p>
        </div>

        <div className="mb-6">
          <p className="text-sm font-medium mb-1">Coordinator access</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            This is a demo placeholder. Real Firebase Auth is pending — no
            credentials are required or validated at this stage.
          </p>
        </div>

        <div className="rounded border border-border bg-muted px-3 py-2 mb-6">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Demo mode</span>
            &nbsp;&middot;&nbsp;Coordinator access is currently open for
            demonstration purposes.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="block w-full text-center rounded bg-primary text-primary-foreground text-sm font-medium px-4 py-2 hover:opacity-90 transition-opacity"
        >
          Continue to Dashboard
        </Link>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Real sign-in will be enabled before final demo.
        </p>
      </div>
    </div>
  );
}
