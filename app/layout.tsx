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
    "A free toolkit for tabletop RPG game masters. Session planning, NPC generators, monster stat blocks, map suggestions, and story arc templates, compatible with the world's greatest roleplaying game.",
  keywords: [
    "D&D",
    "tabletop RPG",
    "DM tools",
    "campaign manager",
    "game master",
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
        <footer style={{ textAlign: "center", padding: "1.5rem 1rem 2rem", fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          DM&apos;s Tome is unofficial fan content. Not affiliated with, endorsed, or sponsored by Wizards of the Coast.
          Dungeons &amp; Dragons and D&amp;D are trademarks of Wizards of the Coast LLC.
        </footer>
      </body>
    </html>
  );
}
