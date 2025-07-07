'use client';
import './globals.css';
import { SessionProvider } from "next-auth/react";
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from "@/context/WishlistContext";
import { NotificationProvider, useNotification } from "@/context/NotificationContext";
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav"; // 👈 BottomNav-г импортлоно

// Notification UI (сагсанд нэмэх мэдэгдэл)
function CartNotification() {
  const { notif } = useNotification();
  if (!notif.show || !notif.product) return null;
  return (
    <div className="fixed bottom-20 right-6 z-50"> {/* 👈 bottom-6 -> bottom-20 болгосон: BottomNav-тай давхцахгүйн тулд */}
      <div className="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-bounce-in">
        <span className="font-bold">{notif.product.name}</span>
        <span className="ml-2">
          {(notif.product.discountPrice || notif.product.price)?.toLocaleString()}₮
        </span>
        <span>сагсанд нэмэгдлээ</span>
      </div>
      <style jsx>{`
        @keyframes bounce-in {
          0% { transform: translateY(40px); opacity: 0; }
          60% { transform: translateY(-10px); opacity: 1; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.5s;
        }
      `}</style>
    </div>
  );
}

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const hideNavbar = pathname === '/login' || pathname === '/register';

  return (
    <html lang="mn">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-montserrat bg-gray-100">
        <SessionProvider>
          <NotificationProvider>
            <CartProvider>
              <WishlistProvider>
                {!hideNavbar && <Navbar />}
                <main className="pb-16">{children}</main> {/* 👈 BottomNav өндөртэй тэнцүү padding доор нэмнэ */}
                <CartNotification />
                {!hideNavbar && <BottomNav />} {/* 👈 BottomNav зөвхөн login/register биш үед */}
                {!hideNavbar && <Footer />}
              </WishlistProvider>
            </CartProvider>
          </NotificationProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
