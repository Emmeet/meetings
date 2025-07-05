import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RAID 2025",
  description:
    "The 28th International Symposium on Research in Attacks, ntrusions and Defenses (RAID 2025)",
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
