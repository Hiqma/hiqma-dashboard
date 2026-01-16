import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { QueryProvider } from '@/lib/queryClient';
import { ToastProvider } from '@/contexts/ToastContext';
import { ToastContainer } from '@/components/Toast';
import { ConfirmationProvider } from '@/contexts/ConfirmationContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/components/theme-provider';
import { LayoutWrapper } from '@/components/LayoutWrapper';
import "./globals.css";
import "../styles/tiptap.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Hiqma Admin Dashboard",
  description: "African Edge-Learning Hub Administration Panel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <ConfirmationProvider>
              <ToastProvider>
                <QueryProvider>
                  <LayoutWrapper>
                    {children}
                  </LayoutWrapper>
                  <ToastContainer />
                </QueryProvider>
              </ToastProvider>
            </ConfirmationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
