import Link from "next/link";
import { LayoutDashboard, Layers, GitBranch, Users, LogIn } from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Programmes", href: "/programs", icon: Layers },
  { label: "Matching", href: "/matching", icon: GitBranch },
  { label: "Relationships", href: "/relationships", icon: Users },
  { label: "Login", href: "/login", icon: LogIn },
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
  const displayStatus = cohortStatus.charAt(0).toUpperCase() + cohortStatus.slice(1);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-52 shrink-0 fixed top-0 left-0 h-screen border-r border-border flex flex-col bg-background z-10">
        {/* Branding */}
        <div className="px-5 pt-6 pb-5 border-b border-border">
          <p className="font-semibold text-foreground leading-none">Verrier</p>
          <p className="text-xs text-muted-foreground mt-1 leading-snug">{programName}</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const isActive = label === activeNav;
            return (
              <Link
                key={label}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-muted text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <Icon size={16} className="shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Cohort info */}
        <div className="px-5 py-4 border-t border-border">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-2">
            Current Cohort
          </p>
          <div className="flex items-center gap-1.5 mb-1">
            <div
              className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0"
              style={{ background: "var(--status-healthy)" }}
            />
            <p className="text-xs font-medium text-foreground truncate">{cohortName}</p>
          </div>
          <p className="text-[10px] text-muted-foreground">
            {cohortWeeks}-Week · {displayStatus}
          </p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 ml-52">
        {children}
      </div>
    </div>
  );
}
