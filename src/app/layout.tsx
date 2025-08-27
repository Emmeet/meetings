import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Asiacrypt 2025 Request for Invitation Letter ",
  description: "Asiacrypt 2025 Request for Invitation Letter ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>{children}</body>
    </html>
  );
}
