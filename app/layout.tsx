// app/layout.tsx
import '../styles/globals.css'
import { ReactNode } from 'react'

export const metadata = {
  title: 'My Login App',
  description: 'Secure login page',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* you can add global <meta> or <link> tags here */}
      </head>
      <body>{children}</body>
    </html>
  )
}
