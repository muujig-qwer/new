'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'

export default function ProductForm({ selectedProduct, setSelectedProduct }) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [image, setImage] = useState(null)

  useEffect(() => {
    if (selectedProduct) {
      setName(selectedProduct.name)
      setPrice(selectedProduct.price)
    }
  }, [selectedProduct])

  const handleSubmit = async (e) => {
    e.preventDefault()

    const formData = new FormData()
    formData.append('name', name)
    formData.append('price', price)
    if (image) formData.append('image', image)

    try {
      if (selectedProduct) {
        // Update product
        await axios.put(
          `http://localhost:5000/api/products/${selectedProduct._id}`,
          formData
        )
        alert('Бүтээгдэхүүн шинэчлэгдлээ')
        setSelectedProduct(null)
      } else {
        // Create product
        await axios.post('http://localhost:5000/api/products', formData)
        alert('Бүтээгдэхүүн нэмэгдлээ')
      }

      setName('')
      setPrice('')
      setImage(null)
      document.getElementById('imageInput').value = ''
    } catch (error) {
      console.error('Алдаа:', error)
      alert('Алдаа гарлаа')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-medium">Нэр</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="border w-full px-3 py-2 rounded"
        />
      </div>

      <div>
        <label className="block font-medium">Үнэ</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          className="border w-full px-3 py-2 rounded"
        />
      </div>

      <div>
        <label className="block font-medium">Зураг</label>
        <input
          type="file"
          id="imageInput"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          className="block w-full"
        />
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {selectedProduct ? 'Шинэчлэх' : 'Нэмэх'}
      </button>
    </form>
  )
}
