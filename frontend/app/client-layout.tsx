// app/client-layout.tsx (Client Component)
"use client"
import { ReactNode } from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { GridBackground } from '@/components/grid-background'
import { AppSidebar } from '@/components/Sidebar'
import { FloatingNav } from '@/components/floating-navbar'
import { usePathname } from 'next/navigation'

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname === '/login' || pathname === '/signup'

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {pathname === '/' ? (
        <div className="min-h-screen bg-background text-foreground relative">
          <GridBackground />
          <FloatingNav />
          <main className="flex-1">{children}</main>
        </div>
      ) : (
        <div className="flex min-h-screen bg-background text-foreground relative">
          <GridBackground />
          {!isAuthPage && <AppSidebar />}
          <main className={`flex-1 transition-[padding] duration-300 ease-in-out ${!isAuthPage ? 'pl-20 group-hover/sidebar:pl-64' : ''}`}>
            {children}
          </main>
        </div>
      )}
    </ThemeProvider>
  )
}
