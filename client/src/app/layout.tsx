import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KanbanPro - High Fidelity Boards",
  description: "A premium kanban experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex h-screen overflow-hidden bg-[#f1f2f4] dark:bg-slate-900`}>
        <Toaster position="bottom-right" />
        <Sidebar />
        <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
          {children}
        </div>
      </body>
    </html>
  );
}
