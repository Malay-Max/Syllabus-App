import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Import Inter
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] }); // Configure Inter

export const metadata: Metadata = {
  title: "Syllabus Explorer",
  description: "Analyze English Literature syllabus data",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased min-h-screen bg-background font-sans`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
