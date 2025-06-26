'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function KidsShoesPage() {
  const [products, setProducts] = useState([])
  const pathname = usePathname()

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/products/category/id/684fc21be765e1b27c9db011') 
      .then(res => setProducts(res.data))
      .catch(err => console.error('Алдаа: ', err))
  }, [])

  const kidsSubcategories = [
    {
      title: 'Хүүхэд',
      items: [
        { name: 'Гутал', href: '/kids/shoes' },
        { name: 'Хувцас', href: '/kids/clothes' },
        { name: 'Дагалдах', href: '/kids/accessories' },
      ],
    },
    {
      title: 'Бусад',
      items: [
        { name: 'Спорт', href: '/others/sport' },
        { name: 'Аялал', href: '/others/travel' },
      ],
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Хүүхэд – Гутал</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Зүүн Sidebar */}
        <aside className="md:col-span-1">
          <nav className="space-y-6">
            {kidsSubcategories.map((section, idx) => (
              <div key={idx}>
                <h2 className="text-lg font-semibold mb-2">{section.title}</h2>
                <ul className="space-y-1">
                  {section.items.map((item, idx) => (
                    <li key={idx}>
                      <Link
                        href={item.href}
                        className={`block px-2 py-1 rounded ${
                          pathname === item.href
                            ? 'bg-yellow-500 text-white'
                            : 'text-gray-700 hover:bg-yellow-50'
                        }`}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Бүтээгдэхүүнүүд */}
        <div className="md:col-span-3">
          {products.length === 0 ? (
            <div>Бүтээгдэхүүн олдсонгүй.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <Link
                  key={product._id}
                  href={`/products/${product._id}`}
                  className="border rounded-lg p-4 hover:shadow-lg transition"
                >
                  {(product.images && product.images.length > 0) ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-48 object-cover mb-2 rounded"
                    />
                  ) : product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover mb-2 rounded"
                    />
                  ) : (
                    <div className="w-full h-48 flex items-center justify-center bg-gray-100 mb-2 rounded text-gray-400">
                      Зураг байхгүй
                    </div>
                  )}
                  <div className="font-semibold">{product.name}</div>
                  <div className="text-gray-600">{product.price}₮</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}