import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import "./globals.css";
import NavBar from "@/components/gadgets/NavBar";
import { DarkModeProvider } from "@/context/DarkModeContext";
import { ClientAuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";

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
        className={GeistSans.className}
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
