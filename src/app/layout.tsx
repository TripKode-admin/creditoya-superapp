import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/gadgets/NavBar";
import { DarkModeProvider } from "@/context/DarkModeContext";
import { ClientAuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Credito Ya",
  description: "Desarrollado por el equipo de TripCode",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientAuthProvider>
          <DarkModeProvider>
            <Toaster richColors position="bottom-right" />
            <NavBar />
            {children}
          </DarkModeProvider>
        </ClientAuthProvider>
      </body>
    </html>
  );
}
