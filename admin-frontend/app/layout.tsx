import type { Metadata } from "next";
import "./globals.css";
import type React from "react";

export const metadata: Metadata = {
  title: "Admin",
  description: "Admin panel",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
