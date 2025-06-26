'use client'
import { useState } from 'react'
import ProductForm from './ProductForm'
import ProductTable from './ProductTable'

export default function AdminPage() {
  const [selectedProduct, setSelectedProduct] = useState(null)

  return (
    <div className="p-6 max-w-4xl pt-30 mx-auto">
      <h1 className="text-2xl font-bold mb-4">🛠️ Admin Dashboard</h1>
      <ProductForm selectedProduct={selectedProduct} setSelectedProduct={setSelectedProduct} />
      <hr className="my-6" />
      <ProductTable setSelectedProduct={setSelectedProduct} />
    </div>
  )
}
