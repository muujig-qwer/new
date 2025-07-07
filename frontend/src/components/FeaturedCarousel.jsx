"use client"
import 'keen-slider/keen-slider.min.css'
import { useKeenSlider } from 'keen-slider/react'
import Link from 'next/link'
import Image from "next/image";

export default function FeaturedCarousel({ products = [] }) {
  const [sliderRef] = useKeenSlider({
    loop: true,
    slides: { perView: 3, spacing: 24 },
    breakpoints: {
      '(max-width: 768px)': { slides: { perView: 1, spacing: 12 } },
      '(min-width: 769px) and (max-width: 1024px)': { slides: { perView: 2, spacing: 16 } },
    }
  })

  return (
    <div ref={sliderRef} className="keen-slider px-2">
      {Array.isArray(products) && products.map(product => (
        <div key={product._id} className="keen-slider__slide">
          <Link href={`/products/${product._id}`}>
            <div className="relative bg-white rounded shadow p-4 h-48 sm:h-56 md:h-64 lg:h-72 overflow-hidden">
              <Image
                src={
                  product.images && product.images.length > 0
                    ? product.images[0]
                    : product.image
                    ? product.image
                    : "/placeholder.png"
                }
                alt={product.name}
                fill
                style={{ objectFit: "cover" }}
                className="rounded"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-90 p-3 rounded-b max-h-16 overflow-hidden">
                <div className="font-semibold text-sm truncate">{product.name}</div>
                <div className="text-gray-600 text-xs">{product.price?.toLocaleString()}₮</div>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  )
}
