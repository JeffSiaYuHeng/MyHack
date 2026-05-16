"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GitBranch,
  Users,
  LogIn,
  Settings,
  HelpCircle,
  Briefcase,
  Bell,
  UserCircle,
  Building2,
  GraduationCap,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard",     href: "/dashboard",     icon: LayoutDashboard },
  { label: "Programmes",    href: "/programs",      icon: Briefcase },
  { label: "Startups",      href: "/startups",      icon: Building2 },
  { label: "Mentors",       href: "/mentors",       icon: GraduationCap },
  { label: "Matching",      href: "/matching",      icon: GitBranch },
  { label: "Relationships", href: "/relationships", icon: Users },
];

interface ProductShellProps {
  children: React.ReactNode;
  programName: string;
  cohortName: string;
  cohortWeeks: number;
  cohortStatus: string;
}

export function ProductShell({
  children,
  cohortStatus,
}: ProductShellProps) {
  const pathname = usePathname();
  const displayStatus = cohortStatus.charAt(0).toUpperCase() + cohortStatus.slice(1);

  // Derive page title from active nav item or sub-route
  const activeNav = NAV_ITEMS.find(
    ({ href }) => pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
  );
  const subPageTitles: Record<string, string> = {
    "/programs/new": "New Programme",
    "/relationships": "Relationships",
  };
  const subTitle = Object.entries(subPageTitles).find(([key]) => pathname.startsWith(key))?.[1];
  const pageTitle = activeNav?.label ?? subTitle ?? "Workbench";

  return (
    <div className="flex min-h-screen bg-[#F5F4F0] text-[#1b1c1a]">
      {/* Fixed SideNavBar */}
      <aside
        className="w-[260px] shrink-0 fixed top-0 left-0 h-screen flex flex-col py-6 z-50 border-r border-[#cbc3d7]"
        style={{ background: "#30312e" }}
      >
        <div className="px-6 mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 relative shrink-0 overflow-hidden rounded-lg border border-white/20">
              <Image
                src="/Verrier Logo.png"
                alt="Verrier Logo"
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            </div>
            <h1 
              className="text-2xl font-bold text-white tracking-tight" 
              style={{ fontFamily: "Source Serif 4, serif" }}
            >
              Verrier
            </h1>
          </div>
          <p className="text-[#cbc3d7] text-[11px] font-medium uppercase tracking-widest opacity-70">
            Venture Workbench
          </p>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            
            return (
              <Link
                key={label}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 border-l-4 ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : "text-[#cbc3d7] hover:bg-white/5 border-transparent"
                }`}
              >
                <Icon
                  size={20}
                  className="shrink-0"
                  style={{ opacity: isActive ? 1 : 0.7 }}
                />
                <span className="text-sm font-medium">{label}</span>
              </Link>
            );
          })}
        </nav>


        <div className="px-3 border-t border-white/10 pt-4 space-y-1">
          <Link
            href="#"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-[#cbc3d7] hover:bg-white/5 transition-colors"
          >
            <Settings size={18} className="opacity-70" />
            <span className="text-sm font-medium">Settings</span>
          </Link>
          <Link
            href="/support"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-[#cbc3d7] hover:bg-white/5 transition-colors"
          >
            <HelpCircle size={18} className="opacity-70" />
            <span className="text-sm font-medium">Support</span>
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-[#cbc3d7] hover:bg-white/5 transition-colors"
          >
            <LogIn size={18} className="opacity-70" />
            <span className="text-sm font-medium">Exit Workbench</span>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 ml-[260px] flex flex-col">
        {/* TopAppBar */}
        <header className="sticky top-0 z-40 flex justify-between items-center h-16 px-8 bg-card/80 backdrop-blur-md border-b border-border">
          {/* Left: page title */}
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-sm font-semibold text-foreground tracking-tight truncate">
              {pageTitle}
            </span>
            {activeNav && (
              <span className="hidden md:block text-[10px] font-medium uppercase tracking-widest text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
                {displayStatus}
              </span>
            )}
          </div>
          {/* Right: actions */}
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              <button className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
                <Bell size={20} />
              </button>
              <button className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
                <UserCircle size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
