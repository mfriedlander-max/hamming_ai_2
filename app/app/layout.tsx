import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { DbInit } from "@/components/layout/DbInit";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PromptLab - Analyze and Improve Your Prompts",
  description:
    "Analyze test batches against system prompts and get traceable improvement suggestions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <DbInit />
        <ErrorBoundary>
          <Header />
          {children}
        </ErrorBoundary>
        <Toaster />
      </body>
    </html>
  );
}
