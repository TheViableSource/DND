import type { Metadata } from "next";
import { Cinzel, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "DM's Tome | D&D Campaign Manager",
  description:
    "Everything a new Dungeon Master needs to run an engaging D&D campaign. Session planning, NPC scripts, monster stat blocks, map suggestions, and story arc templates.",
  keywords: [
    "D&D",
    "Dungeons and Dragons",
    "DM tools",
    "campaign manager",
    "dungeon master",
    "NPC generator",
    "encounter builder",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${cinzel.variable} ${inter.variable}`}>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
