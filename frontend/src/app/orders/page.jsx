"use client"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import axios from "axios"
import Link from "next/link"
import { FaTrash } from "react-icons/fa"
import { useRouter } from "next/navigation"

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    if (!session) return
    const fetchOrders = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/orders?email=${encodeURIComponent(session.user.email)}`,
          {
            headers: { Authorization: `Bearer ${session.accessToken}` }
          }
        )
        setOrders(res.data)
      } catch (err) {
        setError("Захиалга уншихад алдаа гарлаа")
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [session])

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Энэ захиалгыг устгах уу?")) return
    try {
      await axios.delete(`http://localhost:5000/api/orders/${orderId}`)
      setOrders((prev) => prev.filter((o) => o._id !== orderId))
    } catch (err) {
      alert("Захиалга устгахад алдаа гарлаа")
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-lg text-gray-600 mb-4">Захиалгаа харахын тулд нэвтэрнэ үү.</p>
        <a href="/login" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
          Нэвтрэх
        </a>
      </div>
    )
  }

  if (error) {
    return <div className="text-red-600 text-center mt-12">{error}</div>
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto py-10 px-4">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white rounded-xl shadow p-6 space-y-4 text-sm">
        <p className="text-gray-400">Нүүр хуудас · <span className="text-black font-medium">Миний захиалгууд</span></p>

        <nav className="flex flex-col gap-3 mt-4">
          <Link href="/profile" className="flex items-center gap-2 text-gray-700 hover:text-black">
            <span>👤</span> Миний мэдээлэл
          </Link>
          <Link href="/wallet" className="flex items-center gap-2 text-gray-700 hover:text-black">
            <span>📁</span> Хэтэвч
          </Link>
          <Link href="#" className="flex items-center gap-2 text-blue-600 font-medium">
            <span>📦</span> Миний захиалгууд
          </Link>
          <Link href="/favorites" className="flex items-center gap-2 text-gray-700 hover:text-black">
            <span>💚</span> Хүслийн жагсаалт
          </Link>
          <Link href="/profile/coupons" className="flex items-center gap-2 text-gray-700 hover:text-black">
            <span>🎟️</span> Миний купон
          </Link>
          <Link href="/company/support/faq" className="flex items-center gap-2 text-gray-700 hover:text-black">
            <span>❓</span> Тусламж
          </Link>
          <Link href="#" className="flex items-center gap-2 text-gray-700 hover:text-black">
            <span>🚪</span> Гарах
          </Link>
        </nav>
      </aside>

      {/* Orders Section */}
      <section className="flex-1 bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <span className="text-3xl">🧾</span> Миний захиалгууд
          </h1>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16 text-gray-400 bg-gray-50 rounded-xl shadow-inner">
            <p className="text-lg">Та одоогоор захиалга хийгээгүй байна.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow transition">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-gray-800 font-semibold">
                    Захиалгын дугаар: <span className="font-mono text-blue-600">{order._id.slice(-6).toUpperCase()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</div>
                    <button
                      onClick={() => handleDeleteOrder(order._id)}
                      className="ml-2 text-red-600 hover:text-red-800 p-1 rounded transition"
                      title="Захиалга устгах"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <div className="text-green-700 font-bold text-lg">
                    {order.totalPrice.toLocaleString()}₮
                  </div>
                  <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs">
                    {order.cartItems.length} бүтээгдэхүүн
                  </div>
                  {/* Захиалгын статусыг харуулах */}
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-semibold
                      ${
                        order.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : order.status === "assigned"
                          ? "bg-blue-100 text-blue-700"
                          : order.status === "delivered"
                          ? "bg-green-100 text-green-700"
                          : order.status === "cancelled"
                          ? "bg-red-100 text-red-600"
                          : "bg-gray-100 text-gray-600"
                      }
                    `}
                  >
                    {(() => {
                      switch (order.status) {
                        case "pending":
                          return "Хүлээгдэж байна";
                        case "assigned":
                          return "Хүргэлтэд гарсан";
                        case "delivered":
                          return "Хүргэгдсэн";
                        case "cancelled":
                          return "Цуцлагдсан";
                        default:
                          return order.status;
                      }
                    })()}
                  </div>
                </div>

                <ul className="text-sm text-gray-700 space-y-1">
                  {order.cartItems.map((p, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
                      {p.product?.name ? (
                        <>
                          <span className="font-medium">{p.product.name}</span>
                          <span className="text-gray-400">—</span>
                          <span>{p.quantity} ширхэг</span>
                          {p.size && <span className="ml-2 text-gray-500">({p.size})</span>}
                        </>
                      ) : (
                        <>
                          <span className="font-medium text-red-500">Бүтээгдэхүүний мэдээлэл олдсонгүй</span>
                          <span className="text-gray-400">—</span>
                          <span>{p.quantity} ширхэг</span>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
