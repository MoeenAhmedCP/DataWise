import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DataWise — Multi-Tenant SaaS Analytics',
  description: 'AI-powered analytics dashboard for your business metrics',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-[#09090b] text-[#fafafa] antialiased">{children}</body>
    </html>
  )
}
