'use client'
import { useState } from 'react'
import axios from 'axios'

export default function ProductForm() {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()

    const formData = new FormData()
    formData.append('name', name)
    formData.append('price', price)
    if (image) formData.append('image', image)

    try {
      const token = localStorage.getItem('token')
      await axios.post('http://localhost:5000/api/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      })
      alert('Бүтээгдэхүүн амжилттай нэмэгдлээ!')
    } catch (err) {
      console.error('Алдаа:', err)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    setImage(file)
    if (file) {
      setPreview(URL.createObjectURL(file))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4 mt-8">
      <h2 className="text-xl font-bold">📦 Бүтээгдэхүүн нэмэх</h2>
      <input
        type="text"
        placeholder="Нэр"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />
      <input
        type="number"
        placeholder="Үнэ"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="w-full"
      />
      {preview && <img src={preview} alt="Preview" className="w-32 mt-2" />}
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Нэмэх
      </button>
    </form>
  )
}
