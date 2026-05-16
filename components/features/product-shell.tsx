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
      <header className="border-b border-border px-4 md:px-12 py-4 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold tracking-tight">Verrier</span>
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded border border-border text-muted-foreground bg-muted leading-none">
              Demo coordinator
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{programName}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">{cohortName}</p>
          <p className="text-xs text-muted-foreground mt-0.5 capitalize">
            {cohortWeeks}-week programme &middot; {cohortStatus}
          </p>
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
                      ? "border-primary text-foreground"
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
