"use client"
import { ReactNode, useEffect, useState } from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { GridBackground } from '@/components/grid-background'
import { AppSidebar } from '@/components/Sidebar'
import { FloatingNav } from '@/components/floating-navbar'
import { usePathname } from 'next/navigation'

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/change-password' || pathname === '/documentation'
  const [mounted, setMounted] = useState(false)

  
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-8 h-8 flex items-center justify-center">
        <div className="h-4 w-4 rounded-full border-2 border-t-indigo-500 border-r-transparent border-b-indigo-500 border-l-transparent animate-spin" />
      </div>
    )
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
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