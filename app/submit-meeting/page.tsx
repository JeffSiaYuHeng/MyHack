import { MeetingSubmissionForm } from "@/components/features/meeting-submission-form";

export default function SubmitMeetingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-lg mx-auto px-4 py-10">
        {/* Branding */}
        <div className="flex items-center gap-2 mb-10">
          <div className="w-6 h-6 relative shrink-0 overflow-hidden rounded-md">
            <img
              src="/Verrier Logo.png"
              alt="Verrier Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-bold text-sm tracking-tight">Verrier</span>
          <span className="text-muted-foreground mx-1 text-xs">/</span>
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            Mentor Meeting
          </span>
        </div>

        <div className="mb-7">
          <h1 className="text-xl font-bold text-foreground" style={{ letterSpacing: "-0.02em" }}>
            Log your meeting
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            Submit session notes after each mentor meeting. AI analysis will generate a summary,
            signal, and action items within seconds.
          </p>
        </div>

        <MeetingSubmissionForm />

        <p className="text-[10px] text-muted-foreground text-center mt-8 font-mono">
          Having trouble with your token?{" "}
          <span className="font-semibold text-foreground">Contact your programme coordinator.</span>
        </p>
      </div>
    </div>
  );
}
