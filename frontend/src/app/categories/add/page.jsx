'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

export default function AddCategoryPage() {
  const [name, setName] = useState('')
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    try {
      await axios.post(
        'http://localhost:5000/api/categories',
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      alert('Ангилал нэмэгдлээ!')
      router.push('/categories')
    } catch (err) {
      alert('Алдаа: ' + (err.response?.data?.error || ''))
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Ангилал нэмэх</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Ангиллын нэр"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Нэмэх
        </button>
      </form>
    </div>
  )
}