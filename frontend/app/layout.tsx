import { Inter } from 'next/font/google'
import { AppSidebar } from '@/components/Sidebar'
import { ThemeProvider } from "@/components/theme-provider"
import { GridBackground } from '@/components/grid-background'
import { FloatingNav } from '@/components/floating-navbar'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Genome Annotator',
  description: 'A comprehensive web application for bacterial genome annotation and analysis',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if the current path is an auth page
  const isAuthPage = typeof window !== 'undefined' && 
    (window.location.pathname === '/login' || 
     window.location.pathname === '/signup')

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Show floating navbar only on homepage */}
          {window.location.pathname === '/' ? (
            <div className="min-h-screen bg-background text-foreground relative">
              <GridBackground />
              <FloatingNav />
              <main className="flex-1">
                {children}
              </main>
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
      </body>
    </html>
  )
}

