'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'

export default function CategoryListPage() {
  const [categories, setCategories] = useState([])
  const [newCategory, setNewCategory] = useState('')
  const [parent, setParent] = useState('')
  const [editId, setEditId] = useState('')
  const [editName, setEditName] = useState('')
  const [editParentId, setEditParentId] = useState('')

  const fetchCategories = () => {
    axios.get('http://localhost:5000/api/categories')
      .then(res => setCategories(res.data))
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // Category нэмэх
  const handleAdd = async (e) => {
    e.preventDefault()
    if (!newCategory.trim()) return
    const token = localStorage.getItem('token')
    try {
      await axios.post(
        'http://localhost:5000/api/categories',
        { name: newCategory, parent: parent || null },
        { headers: { Authorization: `Bearer ${token}` } }
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
    const token = localStorage.getItem('token')
    try {
      await axios.delete(
        `http://localhost:5000/api/categories/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
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
    const token = localStorage.getItem('token')
    try {
      await axios.put(
        `http://localhost:5000/api/categories/${editId}`,
        { name: editName, parent: editParentId || null },
        { headers: { Authorization: `Bearer ${token}` } }
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

  return (
    <div className="max-w-xl mx-auto pt-30 mt-10 p-6 border rounded shadow">
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
      <ul className="space-y-2"></ul>
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
  )
}