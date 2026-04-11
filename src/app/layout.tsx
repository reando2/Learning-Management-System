import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: {
    default: "LearningHub — Platform Pembelajaran Online",
    template: "%s | LearningHub",
  },
  description:
    "Platform pembelajaran online terbaik dengan ribuan artikel berkualitas tinggi untuk meningkatkan skill Anda.",
  keywords: ["pembelajaran", "online", "artikel", "tutorial", "programming"],
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "LearningHub",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="id">
      <body>
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  );
}
