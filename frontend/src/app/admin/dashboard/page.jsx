'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { jwtDecode } from 'jwt-decode'
import axios from 'axios'
import { BarChart3, Users, PackageCheck } from 'lucide-react'

export default function AdminDashboard() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [stats, setStats] = useState({ products: 0, users: 0, orders: 0 })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    try {
      const decoded = jwtDecode(token)
      if (decoded.role === 'admin') {
        setIsAdmin(true)
      } else {
        router.push('/')
      }
    } catch {
      router.push('/login')
    }
  }, [router])

  useEffect(() => {
    if (isAdmin) {
      const fetchStats = async () => {
        try {
          const [productsRes, usersRes, ordersRes] = await Promise.all([
            axios.get('http://localhost:5000/api/products'),
            axios.get('http://localhost:5000/api/auth/users', {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            }),
            axios.get('http://localhost:5000/api/orders', {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            }),
          ])
          setStats({
            products: productsRes.data.length,
            users: usersRes.data.length,
            orders: ordersRes.data.length,
          })
        } catch (e) {}
      }
      fetchStats()
    }
  }, [isAdmin])

  if (!isAdmin) return <p className="mt-10 text-center">Ачааллаж байна...</p>

  return (
    <div className="max-w-6xl mx-auto pt-32 px-6">
      <h1 className="text-4xl font-bold mb-12 text-center text-gray-800">
        Админ Хяналтын Самбар
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-10">
        <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300">
          <BarChart3 className="h-10 w-10 mb-3" />
          <p className="text-3xl font-bold">{stats.products}</p>
          <p className="mt-2 text-lg">Бүтээгдэхүүн</p>
        </div>

        <div className="bg-green-600 text-white p-6 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300">
          <Users className="h-10 w-10 mb-3" />
          <p className="text-3xl font-bold">{stats.users}</p>
          <p className="mt-2 text-lg">Хэрэглэгчид</p>
        </div>

        <div className="bg-yellow-500 text-white p-6 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300">
          <PackageCheck className="h-10 w-10 mb-3" />
          <p className="text-3xl font-bold">{stats.orders}</p>
          <p className="mt-2 text-lg">Захиалгууд</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="bg-white border rounded-xl p-6 shadow hover:shadow-md transition">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Бүтээгдэхүүн нэмэх</h2>
          <a
            href="/products/add"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            + Шинэ бүтээгдэхүүн
          </a>
        </div>

        <div className="bg-white border rounded-xl p-6 shadow hover:shadow-md transition">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Захиалгууд</h2>
          <a
            href="/admin/orders"
            className="inline-block bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
          >
            Захиалгуудыг үзэх
          </a>
        </div>
      </div>
    </div>
  )
}
