import type { Metadata } from "next";
import "./globals.css";
import Toaster from "@/components/SonnerToaster";

export const metadata: Metadata = {
  title: "AI Interviewer",
  description: "Next Generation AI Interview Simulations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-background text-foreground" suppressHydrationWarning>
        {children}
        <Toaster position="top-center" richColors theme="dark" />
      </body>
    </html>
  );
}
