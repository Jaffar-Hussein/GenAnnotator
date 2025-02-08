"use client";
import { ReactNode, useEffect, useState } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { GridBackground } from "@/components/grid-background";
import { AppSidebar } from "@/components/Sidebar";
import { FloatingNav } from "@/components/floating-navbar";
import { usePathname } from "next/navigation";
import { Banner } from "@/components/Banner";
import GenomicLoader from "@/components/full-screen-loader";

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/change-password" ||
    pathname === "/documentation";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <GenomicLoader />;
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Banner />
      {pathname === "/" ? (
        <div className="min-h-screen bg-background text-foreground relative">
          <GridBackground />
          <FloatingNav />
          <main className="flex-1">{children}</main>
        </div>
      ) : (
        <div className="flex min-h-screen bg-background text-foreground relative">
          <GridBackground />
          {!isAuthPage && <AppSidebar />}
          <main
            className={`flex-1 transition-[padding] duration-300 ease-in-out ${
              !isAuthPage ? "pl-20 group-hover/sidebar:pl-64" : ""
            }`}
          >
            {children}
          </main>
        </div>
      )}
    </ThemeProvider>
  );
}
