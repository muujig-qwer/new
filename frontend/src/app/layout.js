'use client'
import './globals.css'
import { SessionProvider } from "next-auth/react"
import { CartProvider } from '@/context/CartContext'
import { WishlistProvider } from "@/context/WishlistContext";
import { usePathname } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from "@/components/Footer";

export default function RootLayout({ children }) {
  const pathname = usePathname()
  const hideNavbar = pathname === '/login' || pathname === '/register'

  return (
    <html lang="mn">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-montserrat bg-gray-100">
        <SessionProvider>
          <CartProvider>
            <WishlistProvider>
              {!hideNavbar && <Navbar />}
              <main>{children}</main>
              <Footer />
            </WishlistProvider>
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
