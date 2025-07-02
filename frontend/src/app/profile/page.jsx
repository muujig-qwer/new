'use client'
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { useEffect, useState } from "react"
import axios from "axios"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [wallet, setWallet] = useState(null)

  useEffect(() => {
    if (!session?.accessToken) return;
    axios.get("http://localhost:5000/api/wallet/balance", {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    })
      .then(res => setWallet(res.data.wallet || 0))
      .catch(() => setWallet(0));
  }, [session]);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-lg text-gray-600 mb-4">Профайл харахын тулд нэвтэрнэ үү.</p>
        <Link href="/login" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
          Нэвтрэх
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto py-10 px-4">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white rounded-xl shadow p-6 space-y-4 text-sm">
        <p className="text-gray-400">Нүүр хуудас · <span className="text-black font-medium">Профайл</span></p>

        <nav className="flex flex-col gap-3 mt-4">
          <Link href="#" className="flex items-center gap-2 text-blue-600 font-medium">
            <span>👤</span> Миний мэдээлэл
          </Link>
          <Link href="/wallet" className="flex items-center gap-2 text-gray-700 hover:text-black">
            <span>📁</span> Хэтэвч
          </Link>
          <Link href="/orders" className="flex items-center gap-2 text-gray-700 hover:text-black">
            <span>📦</span> Миний захиалгууд
          </Link>
          <Link href="/favorites" className="flex items-center gap-2 text-gray-700 hover:text-black">
            <span>💚</span> Хүслийн жагсаалт
          </Link>
          <Link href="/profile/coupons" className="flex items-center gap-2 text-gray-700 hover:text-black">
            <span>🎟️</span> Миний купон
          </Link>
          <Link href="#" className="flex items-center gap-2 text-gray-700 hover:text-black">
            <span>🔒</span> Нууц үг солих
          </Link>
          <Link href="/company/support/faq" className="flex items-center gap-2 text-gray-700 hover:text-black">
            <span>❓</span> Тусламж
          </Link>
          <Link
            href="#"
            className="flex items-center gap-2 text-gray-700 hover:text-black"
            onClick={(e) => {
              e.preventDefault();
              signOut({ callbackUrl: "/login" });
            }}
          >
            <span>🚪</span> Гарах
          </Link>
        </nav>
      </aside>

      {/* Profile Section */}
      <section className="flex-1 bg-white rounded-xl shadow p-8 flex flex-col items-center">
        <div className="relative mb-6">
          <img
            src={session.user.image || '/default-avatar.png'}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 shadow"
          />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">{session.user.name}</h2>
        <p className="text-gray-500 mb-2">{session.user.email}</p>
        {/* Wallet үлдэгдэл харуулах */}
        <div className="mb-6">
          <span className="text-gray-600">Хэтэвчний үлдэгдэл: </span>
          <span className="text-gray-800 font-semibold">{wallet !== null ? `${wallet} ₮` : 'Тодорхойгүй'}</span>
        </div>
        <button
          onClick={() => window.location.href = '/profile/edit'}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition shadow"
        >
          Профайл засах
        </button>
      </section>
    </div>
  )
}