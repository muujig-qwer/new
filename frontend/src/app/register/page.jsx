'use client'
import { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleImage = e => {
    setImage(e.target.files[0])
    setPreview(URL.createObjectURL(e.target.files[0]))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const data = new FormData()
    data.append('name', form.name)
    data.append('email', form.email)
    data.append('password', form.password)
    if (image) data.append('image', image)

    try {
      await axios.post('http://localhost:5000/api/auth/register', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      router.push('/login')
    } catch (err) {
      setError('Бүртгүүлэх үед алдаа гарлаа')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">
          Бүртгүүлэх
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Нэр
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              placeholder="Таны нэр"
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Имэйл хаяг
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              placeholder="you@example.com"
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Нууц үг
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              placeholder="••••••••"
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
              Зураг
            </label>
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImage}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            />
            {preview && (
              <img
                src={preview}
                alt="preview"
                className="w-24 h-24 rounded-full object-cover mt-2"
              />
            )}
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-lg font-medium hover:bg-gray-800 transition"
          >
            Бүртгүүлэх
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-6">
          Өмнө бүртгүүлсэн үү? <a href="/login" className="underline hover:text-black">Нэвтрэх</a>
        </p>
      </div>
    </div>
  )
}
