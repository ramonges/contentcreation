import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Season Content — Transform Your Social Media Into a Movie",
  description: "Build cinematic content seasons for your brand. Real use cases, real drama, real engagement.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
