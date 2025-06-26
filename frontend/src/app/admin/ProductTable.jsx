'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'

export default function ProductTable({ setSelectedProduct }) {
  const [products, setProducts] = useState([])

  const fetchProducts = async () => {
    const res = await axios.get('http://localhost:5000/api/products')
    setProducts(res.data)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleDelete = async (id) => {
    if (!confirm('Устгах уу?')) return
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`)
      fetchProducts()
    } catch (err) {
      alert('Устгах үед алдаа гарлаа')
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Бүтээгдэхүүн жагсаалт</h2>
      <table className="w-full border text-left">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Зураг</th>
            <th className="p-2 border">Нэр</th>
            <th className="p-2 border">Үнэ</th>
            <th className="p-2 border">Үйлдэл</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id}>
              <td className="p-2 border">
                <img
                  src={`http://localhost:5000/uploads/${p.image}`}
                  alt={p.name}
                  className="h-16 w-16 object-cover rounded"
                />
              </td>
              <td className="p-2 border">{p.name}</td>
              <td className="p-2 border">{p.price}₮</td>
              <td className="p-2 border space-x-2">
                <button
                  onClick={() => setSelectedProduct(p)}
                  className="text-blue-600 hover:underline"
                >
                  Засах
                </button>
                <button
                  onClick={() => handleDelete(p._id)}
                  className="text-red-600 hover:underline"
                >
                  Устгах
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
