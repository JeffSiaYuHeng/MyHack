"use client";

import { useState } from "react";
import {
  MessageCircle,
  BookOpen,
  Zap,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Mail,
  FileText,
  Video,
  CheckCircle,
} from "lucide-react";

const FAQS = [
  {
    q: "How is the Health Score calculated?",
    a: "The Health Score (0–100) is a weighted composite of three signals: days since last mentor–startup meeting (40%), milestone progression velocity (35%), and meeting note sentiment detected by our AI layer (25%). Scores above 70 are Healthy, 50–70 At Risk, and below 50 Critical.",
  },
  {
    q: "How do I generate an AI Cohort Report?",
    a: 'Navigate to Programmes → select a programme → click "✦ View Cohort". On the Cohort Overview page, click "✦ Generate Cohort Report" in the Instant Cohort Intelligence section. The report is generated using live cohort data and powered by Gemini AI.',
  },
  {
    q: "How does the Matching algorithm work?",
    a: "The Matching Workbench scores each mentor–startup pairing across five criteria: stage fit, industry alignment, traction, team strength, and needs fit. Weights are configurable per programme in the Programme Setup Wizard. The top-scored pairs are surfaced as recommended matches.",
  },
  {
    q: "Can I export the Intelligence Report?",
    a: 'Yes. After generating the report on the Cohort Overview page, click "Copy Report" to copy the full plain-text narrative to your clipboard. You can then paste it into any document or email. A "Share with Partners" button will send via your configured integration.',
  },
  {
    q: "How do I add a new programme?",
    a: 'Go to Programmes in the sidebar, then click "New Programme" in the top-right corner. The 5-step Programme Setup Wizard will guide you through defining criteria weights, target markets, required documents, and timeline.',
  },
  {
    q: "What does the Urgency label mean in the Heatmap?",
    a: '"Stale" means no meeting has been logged in over 14 days. "Watch" means the health score dropped more than 10 points in the last 7 days. "Critical" means both conditions apply. These labels are recalculated in real time.',
  },
];

const DOCS = [
  { icon: Video,    title: "Getting Started (5 min)",        desc: "Platform walkthrough for new coordinators",   tag: "Video" },
  { icon: FileText, title: "Programme Setup Guide",           desc: "How to configure criteria weights and stages", tag: "Guide" },
  { icon: BookOpen, title: "Matching Algorithm Deep-Dive",    desc: "Scoring formula and customisation options",    tag: "Reference" },
  { icon: Zap,      title: "Instant Cohort Intelligence API", desc: "How the AI report is generated end-to-end",   tag: "Technical" },
];

type TicketStatus = "idle" | "sending" | "sent";

export function SupportCenter() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [ticketStatus, setTicketStatus] = useState<TicketStatus>("idle");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTicketStatus("sending");
    setTimeout(() => {
      setTicketStatus("sent");
      setSubject("");
      setMessage("");
    }, 1500);
  }

  return (
    <div className="px-8 py-8 space-y-10 max-w-5xl">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Support Centre</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Resources, documentation, and direct help for Verrier Venture Workbench.
        </p>
      </div>

      {/* Quick links row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            icon: BookOpen,
            title: "Documentation",
            desc: "Full platform reference and API docs",
            color: "var(--status-ai)",
            bg: "rgba(124,58,237,0.06)",
            border: "rgba(124,58,237,0.2)",
          },
          {
            icon: MessageCircle,
            title: "Live Chat",
            desc: "Talk to a Verrier specialist (Mon–Fri 9–6 MYT)",
            color: "var(--status-healthy)",
            bg: "rgba(34,197,94,0.06)",
            border: "rgba(34,197,94,0.2)",
          },
          {
            icon: Mail,
            title: "Email Support",
            desc: "support@verrier.io · 24h response SLA",
            color: "var(--status-risk)",
            bg: "rgba(245,158,11,0.06)",
            border: "rgba(245,158,11,0.2)",
          },
        ].map(({ icon: Icon, title, desc, color, bg, border }) => (
          <button
            key={title}
            className="text-left rounded-xl p-5 border transition-all hover:shadow-md hover:-translate-y-0.5"
            style={{ background: bg, borderColor: border }}
          >
            <div className="flex items-start justify-between">
              <Icon size={20} style={{ color }} />
              <ExternalLink size={13} className="text-muted-foreground opacity-60" />
            </div>
            <p className="text-sm font-semibold text-foreground mt-3">{title}</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{desc}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left: FAQ */}
        <div className="lg:col-span-3 space-y-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Frequently Asked Questions
          </p>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-xl overflow-hidden"
              >
                <button
                  className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="text-sm font-medium text-foreground">{faq.q}</span>
                  {openFaq === i ? (
                    <ChevronDown size={16} className="shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronRight size={16} className="shrink-0 text-muted-foreground" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 border-t border-border">
                    <p className="text-sm text-muted-foreground leading-relaxed pt-3">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Docs section */}
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground pt-4">
            Documentation & Guides
          </p>
          <div className="space-y-2">
            {DOCS.map(({ icon: Icon, title, desc, tag }) => (
              <button
                key={title}
                className="w-full flex items-center gap-4 px-5 py-3.5 bg-card border border-border rounded-xl hover:border-primary/30 hover:shadow-sm transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 bg-muted text-muted-foreground rounded-full shrink-0">
                  {tag}
                </span>
                <ExternalLink size={13} className="text-muted-foreground opacity-50 shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Contact form */}
        <div className="lg:col-span-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Submit a Support Ticket
          </p>
          <div className="bg-card border border-border rounded-xl p-6">
            {ticketStatus === "sent" ? (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(34,197,94,0.1)" }}
                >
                  <CheckCircle size={24} style={{ color: "var(--status-healthy)" }} />
                </div>
                <p className="text-sm font-semibold text-foreground">Ticket submitted!</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Our team will respond to <span className="font-medium">sarah@cradle.example</span> within 24 hours.
                </p>
                <button
                  onClick={() => setTicketStatus("idle")}
                  className="mt-2 text-xs font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
                >
                  Submit another ticket
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Subject</label>
                  <input
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Health score not updating"
                    className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow text-foreground placeholder:text-muted-foreground/60"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Category</label>
                  <select className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow text-foreground">
                    <option>Bug Report</option>
                    <option>Feature Request</option>
                    <option>Data Question</option>
                    <option>Integration Help</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Message</label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe the issue or question in detail…"
                    className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow resize-none text-foreground placeholder:text-muted-foreground/60"
                  />
                </div>
                <button
                  type="submit"
                  disabled={ticketStatus === "sending"}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-60"
                  style={{ background: "var(--primary)" }}
                >
                  {ticketStatus === "sending" ? "Sending…" : "Submit Ticket"}
                </button>
                <p className="text-[10px] text-muted-foreground text-center">
                  Response within 24 h · Mon–Fri 9AM–6PM MYT
                </p>
              </form>
            )}
          </div>

          {/* System status */}
          <div className="mt-4 bg-card border border-border rounded-xl px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-foreground">System Status</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">All services operational</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium" style={{ color: "var(--status-healthy)" }}>Healthy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
