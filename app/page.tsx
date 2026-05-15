import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-background text-foreground">
      <main className="max-w-4xl w-full text-center space-y-12">
        <div className="space-y-4">
          <h1 className="text-7xl font-extrabold tracking-tighter">
            Team <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">MyHack</span>
          </h1>
          <p className="text-2xl text-muted-foreground font-medium">
            Build With AI 2026 KL Prototype
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-12">
          {["Jeff", "Chun Xin", "Hamse", "Rose"].map((member) => (
            <div key={member} className="p-4 border rounded-xl bg-card shadow-sm">
              <p className="font-semibold">{member}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <div className="p-6 border rounded-2xl bg-card text-left space-y-2">
            <h2 className="text-xl font-bold">System Status</h2>
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              <p className="text-sm font-medium">Scaffold Operational</p>
            </div>
            <p className="text-xs text-muted-foreground">Next.js + Firebase + Gemini + Cloud Run</p>
          </div>
          <div className="p-6 border rounded-2xl bg-card text-left space-y-2">
            <h2 className="text-xl font-bold">Quick Actions</h2>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">Test AI API</Button>
              <Button variant="outline" size="sm">Auth Login</Button>
            </div>
          </div>
        </div>

        <div className="mt-12 p-12 border-4 border-dashed rounded-3xl bg-muted/30">
          <p className="text-muted-foreground text-lg italic">
            Waiting for Topic Drop... 🧭
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Phase 0: Silent Read → Brainstorm → Vote → Lock
          </p>
        </div>
      </main>
      
      <footer className="mt-20 text-muted-foreground text-sm">
        Sunway University, Petaling Jaya · May 16–17, 2026
      </footer>
    </div>
  );
}
