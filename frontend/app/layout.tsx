import './globals.css'
import { Inter } from 'next/font/google'
import { Metadata } from 'next'
import ClientLayout from './client-layout'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Genome Annotator',
  description: 'A comprehensive web application for bacterial genome annotation and analysis',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}
