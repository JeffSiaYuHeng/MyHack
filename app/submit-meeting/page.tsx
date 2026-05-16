import { MeetingSubmissionForm } from "@/components/features/meeting-submission-form";

export default function SubmitMeetingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-lg mx-auto px-4 py-10">
        {/* Branding */}
        <div className="mb-8">
          <p className="text-base font-semibold tracking-tight">Verrier</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Mentor meeting submission
          </p>
        </div>

        {/* Context copy */}
        <div className="mb-6">
          <h1 className="text-sm font-semibold">Log your meeting</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Submit your session notes after each mentor meeting. AI analysis will
            generate a summary, signal, and action items within minutes.
          </p>
        </div>

        <MeetingSubmissionForm />

        <p className="text-[10px] text-muted-foreground mt-6 text-center">
          Having trouble with your token?{" "}
          <span className="font-medium text-foreground">
            Contact your programme coordinator.
          </span>
        </p>
      </div>
    </div>
  );
}
