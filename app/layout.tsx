import type { Metadata } from "next";
import { Geist, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Verrier",
  description: "AI-powered relationship management for innovation programmes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster
          position="top-right"
          gutter={10}
          toastOptions={{
            duration: 4200,
            style: {
              background: "var(--card)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              boxShadow: "0 18px 45px color-mix(in srgb, var(--foreground) 14%, transparent)",
              fontSize: "13px",
              lineHeight: "1.4",
              maxWidth: "380px",
              padding: "12px 14px",
            },
            success: {
              iconTheme: {
                primary: "var(--status-healthy)",
                secondary: "var(--status-healthy-bg)",
              },
            },
            error: {
              iconTheme: {
                primary: "var(--status-critical)",
                secondary: "var(--status-critical-bg)",
              },
              duration: 5200,
            },
            loading: {
              iconTheme: {
                primary: "var(--status-ai)",
                secondary: "var(--muted)",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
