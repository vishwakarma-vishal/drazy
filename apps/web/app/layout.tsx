import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Drazy",
  description: "Think it. Draw it. Sync it.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
