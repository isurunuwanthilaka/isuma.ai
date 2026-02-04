import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Isuma.ai - AI-Powered Hiring Platform",
  description: "Hire the best talent with AI-powered assessments and anti-cheating technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
