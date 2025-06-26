'use client'
import { useEffect, useState } from 'react'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:5000/api/orders/admin/orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await res.json()
      setOrders(data)
      setLoading(false)
    }
    fetchOrders()
  }, [])

  if (loading) return <div>Уншиж байна...</div>

  return (
    <div className=" p-6">
      <h1 className="text-2xl font-bold pt-20 mb-4">Бүх захиалгууд</h1>
      <table className="min-w-full bg-white text-black">
        <thead>
          <tr>
            <th className="border px-4 py-2">Захиалга #</th>
            <th className="border px-4 py-2">Хэрэглэгч</th>
            <th className="border px-4 py-2">Имэйл</th>
            <th className="border px-4 py-2">Огноо</th>
            <th className="border px-4 py-2">Нийт дүн</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td className="border px-4 py-2">{order._id}</td>
              <td className="border px-4 py-2">{order.user?.name}</td>
              <td className="border px-4 py-2">{order.user?.email}</td>
              <td className="border px-4 py-2">{new Date(order.createdAt).toLocaleString()}</td>
              <td className="border px-4 py-2">{order.totalPrice}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}