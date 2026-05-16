import Link from "next/link";
import Image from "next/image";

const STATS = [
  { value: "30+", label: "Startups tracked" },
  { value: "< 2s", label: "AI diagnosis" },
  { value: "34%", label: "Avg health gain" },
  { value: "100+", label: "Data points / pair" },
];

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left — dark brand panel */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
        style={{ background: "#0b0b0b" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 relative shrink-0 overflow-hidden rounded-md">
            <Image
              src="/Verrier Logo.png"
              alt="Verrier Logo"
              width={24}
              height={24}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-white font-semibold text-sm tracking-tight">Verrier</span>
        </div>

        <div>
          <p
            className="text-[10px] font-mono uppercase tracking-widest mb-5"
            style={{ color: "#797979" }}
          >
            AI Relationship Engine
          </p>
          <h1
            className="text-[42px] font-bold leading-[1.1]"
            style={{ color: "#ffffff", letterSpacing: "-0.03em" }}
          >
            Relationships that{" "}
            <span style={{ color: "#f36458" }}>survive</span>
            <br />
            the programme.
          </h1>
          <p className="mt-5 text-sm leading-relaxed" style={{ color: "#b9b9b9", maxWidth: 380 }}>
            Track every mentor–startup pair in real time. Gemini AI surfaces friction before it
            becomes failure.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-5">
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl font-black tabular-nums" style={{ color: "#ffffff" }}>
                  {value}
                </p>
                <p className="text-[10px] font-mono mt-1" style={{ color: "#797979" }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[10px] font-mono" style={{ color: "#353535" }}>
          Verrier · Hackathon Demo 2026
        </p>
      </div>

      {/* Right — light form panel */}
      <div className="flex-1 flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-6 h-6 relative shrink-0 overflow-hidden rounded-md">
              <Image
                src="/Verrier Logo.png"
                alt="Verrier Logo"
                width={24}
                height={24}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-semibold text-sm">Verrier</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground" style={{ letterSpacing: "-0.02em" }}>
              Coordinator access
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Sign in to your programme dashboard.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-1.5">
                Email
              </label>
              <input
                type="email"
                defaultValue="sarah@cradle.example"
                readOnly
                className="w-full px-3 py-2.5 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#f36458]"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-1.5">
                Password
              </label>
              <input
                type="password"
                defaultValue="demo-password"
                readOnly
                className="w-full px-3 py-2.5 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-3 px-3 py-2.5 rounded-md bg-muted border border-border/60">
            <p className="text-[10px] text-muted-foreground">
              <span className="font-semibold text-foreground">Demo mode</span> · Credentials
              pre-filled. Click Continue to access the dashboard.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="mt-5 flex items-center justify-center w-full py-2.5 text-sm font-bold rounded-full transition-opacity hover:opacity-90"
            style={{ background: "#f36458", color: "#ffffff" }}
          >
            Continue to Dashboard →
          </Link>

          <p className="text-[10px] text-muted-foreground text-center mt-5 font-mono">
            Secured by Firebase Auth
          </p>
        </div>
      </div>
    </div>
  );
}
