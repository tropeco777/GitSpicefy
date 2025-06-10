import "./globals.css";
import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SessionProvider } from "@/components/SessionProvider";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import AnimatedBackground from "@/components/AnimatedBackground";

const raleway = Raleway({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "GitSpicefy - %s",
    default: "GitSpicefy - AI-Powered GitHub Documentation Generator",
  },
  description:
    "Transform your GitHub repositories into comprehensive, professional documentation with AI-powered analysis and generation.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" }
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${raleway.className} antialiased bg-white dark:bg-dark-100 text-dark-200 dark:text-stone-200`}
      >
        <SessionProvider>
          <SubscriptionProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              <AnimatedBackground />
              <div className="relative z-10 min-h-screen">
                {children}
              </div>
            </ThemeProvider>
          </SubscriptionProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
