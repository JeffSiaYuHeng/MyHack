import Link from "next/link";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Programmes", href: "/programs/program-cradle-accelerator-2026/applicants" },
  { label: "Matching", href: "/matching" },
  { label: "Relationships", href: "/relationships" },
  { label: "Login", href: "/login" },
];

interface ProductShellProps {
  children: React.ReactNode;
  programName: string;
  cohortName: string;
  cohortWeeks: number;
  cohortStatus: string;
  activeNav?: string;
}

export function ProductShell({
  children,
  programName,
  cohortName,
  cohortWeeks,
  cohortStatus,
  activeNav,
}: ProductShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-4 md:px-12 py-4 flex items-center justify-between">
        {/* Left: wordmark + programme name */}
        <div>
          <span className="text-base font-semibold text-foreground tracking-tight">
            Verrier
          </span>
          <p className="text-xs text-muted-foreground mt-0.5">{programName}</p>
        </div>

        {/* Right: live cohort pill */}
        <div className="flex items-center gap-2">
          <div
            className="h-1.5 w-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: "var(--status-healthy)" }}
          />
          <span className="text-sm font-medium text-foreground">{cohortName}</span>
          <span className="text-xs text-muted-foreground capitalize">
            &middot; {cohortWeeks}-week &middot; {cohortStatus}
          </span>
        </div>
      </header>

      <nav className="border-b border-border px-4 md:px-12">
        <ul className="flex">
          {NAV_ITEMS.map(({ label, href }) => {
            const isActive = label === activeNav;
            return (
              <li key={label}>
                <Link
                  href={href}
                  className={`inline-block px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="max-w-[1440px] mx-auto">{children}</div>
    </div>
  );
}
