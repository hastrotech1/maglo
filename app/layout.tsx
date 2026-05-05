import type { Metadata } from "next";
import { Kumbh_Sans } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const kumbhSans = Kumbh_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Maglo Finance",
  description: "Finance Management Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={kumbhSans.variable} suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
        {/* Global toast container — picks up all toast() calls */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              borderRadius: "10px",
              background: "#1f2937",
              color: "#f9fafb",
              fontSize: "13px",
            },
          }}
        />
      </body>
    </html>
  );
}
