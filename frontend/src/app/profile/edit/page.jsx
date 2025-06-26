'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'

export default function UpdateProfilePage() {
  const [form, setForm] = useState({ name: '', email: '' })
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Fetch current user profile
  useEffect(() => {
    axios
      .get('http://localhost:5000/api/auth/profile', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then((res) => {
        setForm({ name: res.data.name, email: res.data.email })
        if (res.data.image)
          setPreview(`http://localhost:5000/uploads/${res.data.image}`)
      })
      .catch(() => setError('Профайл уншихад алдаа гарлаа'))
  }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleImage = (e) => {
    setImage(e.target.files[0])
    setPreview(URL.createObjectURL(e.target.files[0]))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)
    try {
      const data = new FormData()
      data.append('name', form.name)
      if (image) data.append('image', image)
      // email-ийг өөрчлөхгүй бол backend-д илгээхгүй байж болно

      const res = await axios.put(
        'http://localhost:5000/api/auth/profile',
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      setSuccess(true)
      if (res.data.user.image)
        setPreview(`http://localhost:5000/uploads/${res.data.user.image}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Шинэчлэхэд алдаа гарлаа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto mt-40 bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-3xl font-extrabold text-center mb-6 text-blue-700">
        Профайл шинэчлэх
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <img
              src={preview || '/default-avatar.png'}
              alt="profile"
              className="w-28 h-28 rounded-full object-cover border-4 border-blue-200 shadow"
            />
            <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer shadow-lg hover:bg-blue-700 transition">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l-6 6m-2 2h6"
                />
              </svg>
              <input
                type="file"
                accept="image/*"
                onChange={handleImage}
                className="hidden"
              />
            </label>
          </div>
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-1">Нэр</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Нэр"
            className="w-full border border-blue-200 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-1">Имэйл</label>
          <input
            name="email"
            value={form.email}
            disabled
            className="w-full border border-gray-200 px-4 py-2 rounded-lg bg-gray-100 text-gray-500"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold py-2 rounded-lg shadow hover:from-blue-600 hover:to-blue-800 transition"
          disabled={loading}
        >
          {loading ? 'Шинэчилж байна...' : 'Шинэчлэх'}
        </button>
        {success && (
          <div className="text-green-600 text-center font-semibold">
            Амжилттай шинэчлэгдлээ!
          </div>
        )}
        {error && <div className="text-red-600 text-center">{error}</div>}
      </form>
    </div>
  )
}
