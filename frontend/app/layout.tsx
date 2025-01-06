import { ReactNode } from 'react'
import { AppSidebar } from './Sidebar'
import Header from '@/components/Header'

interface LayoutProps {
  children: ReactNode
  showHeader?: boolean
  showSidebar?: boolean
}

export function Layout({ children, showHeader = true, showSidebar = true }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {showSidebar && <AppSidebar />}
        <div className="flex-1">
          {showHeader && <Header />}
          <main className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
