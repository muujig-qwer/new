'use client'
import { useEffect, useState } from 'react'
import Link from "next/link";
import clsx from "clsx";
import {
  BarChart3,
  Users,
  PackageCheck,
  PlusCircle,
  Tag,
  Layers,
  Settings,
  FileBarChart2,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from 'axios'

export default function AdminCategoriesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState([])
  const [newCategory, setNewCategory] = useState('')
  const [parent, setParent] = useState('')
  const [editId, setEditId] = useState('')
  const [editName, setEditName] = useState('')
  const [editParentId, setEditParentId] = useState('')
  const [loading, setLoading] = useState(true);

  const navItems = [
    { key: "dashboard", label: "Хянах самбар", icon: BarChart3, href: "/admin/dashboard" },
    { key: "products", label: "Бүтээгдэхүүн", icon: PlusCircle, href: "/admin/products" },
    { key: "orders", label: "Захиалгууд", icon: PackageCheck, href: "/admin/orders" },
    { key: "users", label: "Хэрэглэгчид", icon: Users, href: "/admin/users" },
    { key: "categories", label: "Ангилал", icon: Tag, href: "/admin/categories" },
    { key: "coupons", label: "Купон", icon: Layers, href: "/admin/coupons" },
    { key: "reports", label: "Тайлан", icon: FileBarChart2, href: "/admin/reports" },
  ];

  const fetchCategories = () => {
    axios.get('http://localhost:5000/api/categories', {
      headers: { Authorization: `Bearer ${session?.accessToken}` }
    })
      .then(res => setCategories(res.data))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (session?.accessToken) fetchCategories()
  }, [session])

  // Category нэмэх
  const handleAdd = async (e) => {
    e.preventDefault()
    if (!newCategory.trim()) return
    try {
      await axios.post(
        'http://localhost:5000/api/categories',
        { name: newCategory, parent: parent || null },
        { headers: { Authorization: `Bearer ${session?.accessToken}` } }
      )
      setNewCategory('')
      setParent('')
      fetchCategories()
    } catch {
      alert('Ангилал нэмэхэд алдаа гарлаа')
    }
  }

  // Category устгах
  const handleDelete = async (id) => {
    if (!window.confirm('Устгахдаа итгэлтэй байна уу?')) return
    try {
      await axios.delete(
        `http://localhost:5000/api/categories/${id}`,
        { headers: { Authorization: `Bearer ${session?.accessToken}` } }
      )
      fetchCategories()
    } catch {
      alert('Устгах үед алдаа гарлаа')
    }
  }

  // Category засах
  const handleEdit = async (e) => {
    e.preventDefault()
    if (!editId || !editName.trim()) return
    try {
      await axios.put(
        `http://localhost:5000/api/categories/${editId}`,
        { name: editName, parent: editParentId || null },
        { headers: { Authorization: `Bearer ${session?.accessToken}` } }
      )
      setEditId('')
      setEditName('')
      setEditParentId('')
      fetchCategories()
    } catch {
      alert('Засах үед алдаа гарлаа')
    }
  }

  // Parent category-г нэрээр авах функц
  const getParentName = (cat) => {
    if (!cat.parent) return ''
    const parent = categories.find(c => c._id === cat.parent)
    return parent ? parent.name : ''
  }

  if (loading) return <div>Уншиж байна...</div>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg min-h-screen">
        <div className="text-xl font-bold text-green-700 p-6">🛍 Admin Panel</div>
        <nav className="space-y-1 px-3">
          {navItems.map(({ key, label, icon: Icon, href }) => (
            <Link
              key={key}
              href={href}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded hover:bg-green-100 text-sm",
                key === "categories"
                  ? "bg-green-200 text-green-900 font-medium"
                  : "text-gray-700"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 p-10">
        <div className="max-w-xl mx-auto p-6 border rounded shadow bg-white">
          <h1 className="text-2xl font-bold mb-6">Ангиллын жагсаалт</h1>

          {/* Category нэмэх */}
          <form onSubmit={handleAdd} className="flex gap-2 mb-6 flex-wrap">
            <input
              type="text"
              placeholder="Шинэ ангилал"
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              className="border p-2 rounded flex-1"
            />
            <select
              value={parent}
              onChange={e => setParent(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="">Эцэг ангилалгүй</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Нэмэх
            </button>
          </form>

          {/* Category жагсаалт */}
          <ul className="space-y-2">
            {categories.map(cat => (
              <li key={cat._id} className="border p-2 rounded flex justify-between items-center">
                {editId === cat._id ? (
                  <form onSubmit={handleEdit} className="flex gap-2 flex-1 flex-wrap">
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="border p-1 rounded flex-1"
                    />
                    <select
                      value={editParentId}
                      onChange={e => setEditParentId(e.target.value)}
                      className="border p-1 rounded"
                    >
                      <option value="">Эцэг ангилалгүй</option>
                      {categories
                        .filter(c => c._id !== cat._id)
                        .map(c => (
                          <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                    </select>
                    <button
                      type="submit"
                      className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                    >
                      Хадгалах
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEditId(''); setEditName(''); setEditParentId('') }}
                      className="bg-gray-400 text-white px-2 py-1 rounded hover:bg-gray-500"
                    >
                      Болих
                    </button>
                  </form>
                ) : (
                  <>
                    <span>
                      {cat.name}
                      {getParentName(cat) && (
                        <span className="ml-2 text-xs text-gray-500">
                          (Эцэг: {getParentName(cat)})
                        </span>
                      )}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditId(cat._id)
                          setEditName(cat.name)
                          setEditParentId(cat.parent || '')
                        }}
                        className="bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500"
                      >
                        Засах
                      </button>
                      <button
                        onClick={() => handleDelete(cat._id)}
                        className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                      >
                        Устгах
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  )
}