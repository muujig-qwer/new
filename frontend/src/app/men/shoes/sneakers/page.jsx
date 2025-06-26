'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function SneakersPage() {
  const [products, setProducts] = useState([])
  const pathname = usePathname()

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/products/category/id/684f88e63756ab9fdd1a7807')
      .then(res => setProducts(res.data))
      .catch(err => console.error('Алдаа: ', err))
  }, [])

  const menSubcategories = [
    {
      title: 'Гутал',
      items: [
        { name: 'Пүүз', href: '/men/shoes/sneakers' },
        { name: 'Арьсан гутал', href: '/men/shoes/leather' },
        { name: 'Сандаал', href: '/men/shoes/sandals' },
      ],
    },
    {
      title: 'Хувцас',
      items: [
        { name: 'Футболк', href: '/men/clothes/tshirts' },
        { name: 'Өмд', href: '/men/clothes/pants' },
        { name: 'Куртик', href: '/men/clothes/jackets' },
      ],
    },
    {
      title: 'Дагалдах',
      items: [
        { name: 'Малгай', href: '/men/accessories/hats' },
        { name: 'Цүнх', href: '/men/accessories/bags' },
        { name: 'Бүс', href: '/men/accessories/belts' },
      ],
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 pt-30 pb-8">
      <h1 className="text-3xl font-bold mb-8">Эрэгтэй – Пүүз</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Зүүн талын Sidebar */}
        <aside className="md:col-span-1">
          <nav className="space-y-6">
            {menSubcategories.map((section, idx) => (
              <div key={idx}>
                <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  {section.title}
                  {/* Хэрвээ "Гутал" хэсэг бол пүүзний тоог харуулна */}
                  {section.title === 'Гутал' && (
                    <span className="text-xs bg-black text-white rounded-full px-2 py-0.5">
                      {products.length}
                    </span>
                  )}
                </h2>
                <ul className="space-y-1">
                  {section.items.map((item, idx) => (
                    <li key={idx}>
                      <Link
                        href={item.href}
                        className={`block px-2 py-1 rounded ${
                          pathname === item.href
                            ? 'bg-black text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {item.name}
                        {/* Хэрвээ энэ нь "Пүүз" бол тоог харуулна */}
                        {item.name === 'Пүүз' && (
                          <span className="ml-2 text-xs bg-gray-200 text-gray-700 rounded-full px-2">
                            {products.length}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Баруун талын бүтээгдэхүүнүүд */}
        <div className="md:col-span-3">
          {products.length === 0 ? (
            <div>Бүтээгдэхүүн олдсонгүй.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => {
                // Зураг авах функц
                const getImageUrl = (img) => {
                  if (!img) return '/fallback.jpg'
                  if (img.startsWith('http://') || img.startsWith('https://')) return img
                  return `http://localhost:5000/uploads/${img}`
                }
                // images массивын эхний зураг эсвэл image талбар
                const thumb = product.images?.[0] || product.image

                return (
                  <Link
                    key={product._id}
                    href={`/products/${product._id}`}
                    className="border rounded-lg p-4 hover:shadow-lg transition"
                  >
                    {thumb ? (
                      <img
                        src={getImageUrl(thumb)}
                        alt={product.name}
                        className="w-full h-48 object-cover mb-2 rounded"
                        onError={e => { e.target.src = '/fallback.jpg' }}
                      />
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center bg-gray-100 mb-2 rounded text-gray-400">
                        Зураг байхгүй
                      </div>
                    )}
                    <div className="font-semibold">{product.name}</div>
                    <div className="text-gray-600">{product.price}₮</div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
