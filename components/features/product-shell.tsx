import Link from "next/link";
import { LayoutDashboard, Layers, GitBranch, Users, LogIn } from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Programmes", href: "/programs", icon: Layers },
  { label: "Matching", href: "/matching", icon: GitBranch },
  { label: "Relationships", href: "/relationships", icon: Users },
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
      <aside
        className="w-56 shrink-0 fixed top-0 left-0 h-screen flex flex-col z-10"
        style={{ background: "#0b0b0b", borderRight: "1px solid #252525" }}
      >
        {/* Branding */}
        <div className="px-5 pt-6 pb-5" style={{ borderBottom: "1px solid #1e1e1e" }}>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span
              className="w-5 h-5 rounded flex items-center justify-center shrink-0 text-[10px] font-black"
              style={{ background: "#f36458", color: "#ffffff" }}
            >
              V
            </span>
            <span
              className="text-[15px] font-bold"
              style={{ color: "#ffffff", letterSpacing: "-0.03em", fontFamily: "var(--font-sans)" }}
            >
              Verrier
            </span>
          </div>
          <p className="text-[10px] leading-snug font-mono truncate pl-0.5" style={{ color: "#4a4a4a" }}>
            {programName}
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2.5 overflow-y-auto">
          <p
            className="text-[9px] font-bold uppercase tracking-[0.16em] px-3 mb-2 font-mono"
            style={{ color: "#444" }}
          >
            Workspace
          </p>
          <div className="space-y-0.5">
            {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
              const isActive = label === activeNav;
              return (
                <Link
                  key={label}
                  href={href}
                  className="relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-colors hover:bg-white/[0.04]"
                  style={{
                    color: isActive ? "#ffffff" : "#888",
                    background: isActive
                      ? "color-mix(in srgb, var(--status-ai) 13%, transparent)"
                      : "transparent",
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {isActive && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-full"
                      style={{ background: "var(--status-ai)" }}
                    />
                  )}
                  <Icon
                    size={14}
                    className="shrink-0"
                    style={{ color: isActive ? "var(--status-ai)" : undefined, opacity: isActive ? 1 : 0.6 }}
                  />
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Cohort card */}
        <div className="px-3 mb-3">
          <div
            className="rounded-xl px-4 py-3.5"
            style={{ background: "#141414", border: "1px solid #222" }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <div
                className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0"
                style={{ background: "#37cd84" }}
              />
              <p
                className="text-[9px] font-bold uppercase tracking-[0.14em] font-mono"
                style={{ color: "#444" }}
              >
                Active Cohort
              </p>
            </div>
            <p
              className="text-[13px] font-semibold leading-snug mb-1"
              style={{ color: "#e8e8e8", wordBreak: "break-word" }}
            >
              {cohortName}
            </p>
            <p className="text-[10px] font-mono" style={{ color: "#555" }}>
              {cohortWeeks}w · {displayStatus}
            </p>
          </div>
        </div>

        {/* Bottom utility */}
        <div className="px-2.5 pb-4" style={{ borderTop: "1px solid #1e1e1e" }}>
          <Link
            href="/login"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-colors hover:bg-white/[0.04] mt-3"
            style={{ color: "#555" }}
          >
            <LogIn size={14} className="shrink-0" style={{ opacity: 0.6 }} />
            Login
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 ml-56">{children}</div>
    </div>
  );
}
