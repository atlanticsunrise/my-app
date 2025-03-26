import './globals.css'
import { Inter } from 'next/font/google'
import AuthProvider from '@/components/AuthProvider'
import Navbar from '@/components/Navbar' // <-- Import Navbar

const inter = Inter({ subsets: ['latin'] })

// ... metadata ...

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar /> {/* <-- Add Navbar here */}
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}
