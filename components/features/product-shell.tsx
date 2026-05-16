import Link from "next/link";
import { 
  LayoutDashboard, 
  Layers, 
  GitBranch, 
  Users, 
  LogIn, 
  Settings, 
  HelpCircle, 
  Plus,
  Briefcase,
  Lightbulb,
  Search,
  Bell,
  UserCircle
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Portfolio", href: "/programs", icon: Briefcase },
  { label: "Relationships", href: "/relationships", icon: Users },
  { label: "Mentors", href: "/matching", icon: GitBranch },
  { label: "Insights", href: "/dashboard", icon: Lightbulb },
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
    <div className="flex min-h-screen bg-[#F5F4F0] text-[#1b1c1a]">
      {/* Fixed SideNavBar */}
      <aside
        className="w-[260px] shrink-0 fixed top-0 left-0 h-screen flex flex-col py-6 z-50 border-r border-[#cbc3d7]"
        style={{ background: "#30312e" }}
      >
        <div className="px-6 mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 relative shrink-0 overflow-hidden rounded-lg border border-white/20">
              <img
                src="/Verrier Logo.png"
                alt="Verrier Logo"
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
            const isActive = label === activeNav;
            return (
              <Link
                key={label}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 border-l-4 ${
                  isActive 
                    ? "bg-[#6b38d4] text-white border-[#6b38d4]" 
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

        <div className="px-6 mb-6">
          <Link
            href="/matching"
            className="w-full bg-[#ff5a5f] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg text-sm"
          >
            <Plus size={18} />
            New Relationship
          </Link>
        </div>

        <div className="px-3 border-t border-white/10 pt-4 space-y-1">
          <Link
            href="#"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-[#cbc3d7] hover:bg-white/5 transition-colors"
          >
            <Settings size={18} className="opacity-70" />
            <span className="text-sm font-medium">Settings</span>
          </Link>
          <Link
            href="#"
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
        <header className="sticky top-0 z-40 flex justify-between items-center h-16 px-8 bg-white/80 backdrop-blur-md border-b border-[#cbc3d7]">
          <div className="flex items-center bg-[#f5f4f0] px-4 py-2 rounded-full border border-[#cbc3d7] w-96 focus-within:ring-2 focus-within:ring-[#6b38d4] transition-all">
            <Search size={18} className="text-[#494454] mr-2" />
            <input 
              className="bg-transparent border-none outline-none text-sm w-full focus:ring-0 text-[#1b1c1a]" 
              placeholder="Search workbench..." 
              type="text"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="bg-[#6b38d4] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-all shadow-sm">
              Add Startup
            </button>
            <div className="flex gap-1">
              <button className="p-2 text-[#494454] hover:bg-[#efeeea] rounded-full transition-colors">
                <Bell size={20} />
              </button>
              <button className="p-2 text-[#494454] hover:bg-[#efeeea] rounded-full transition-colors">
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
