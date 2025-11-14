import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import Providers from "@/components/Providers";
import LayoutWrapper from "@/components/layout/LayoutWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Whistle - Anonymous Whistleblowing Platform",
  description: "A secure, anonymous, AI-moderated platform for sharing truth and verified information",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      afterSignInUrl="/home"
      afterSignUpUrl="/home"
    >
      <html lang="en" className="dark">
        <body className={inter.className}>
          <Providers>
            <LayoutWrapper>{children}</LayoutWrapper>

            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#121316',
                  color: '#e6eef8',
                  border: '1px solid #1f2128',
                },
              }}
            />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
