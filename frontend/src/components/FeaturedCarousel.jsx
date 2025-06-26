'use client'
import 'keen-slider/keen-slider.min.css'
import { useKeenSlider } from 'keen-slider/react'
import Link from 'next/link'
import React from "react";

export default function FeaturedCarousel({ products = [] }) {
  const [sliderRef] = useKeenSlider({
    loop: true,
    slides: { perView: 3, spacing: 16 },
    breakpoints: {
      '(max-width: 768px)': { slides: { perView: 1 } },
      '(min-width: 769px) and (max-width: 1024px)': { slides: { perView: 2 } },
    }
  })

  return (
    <div ref={sliderRef} className="keen-slider">
      {Array.isArray(products) && products.map(product => (
        <div key={product._id} className="keen-slider__slide">
          <Link href={`/products/${product._id}`}>
            <div className="bg-white rounded shadow p-4 mx-2">
              <img
                src={
                  product.images && product.images.length > 0
                    ? product.images[0]
                    : product.image
                    ? product.image
                    : "/placeholder.png"
                }
                alt={product.name}
                className="w-full h-48 object-cover rounded mb-2"
              />
              <div className="font-semibold">{product.name}</div>
              <div className="text-gray-600">{product.price?.toLocaleString()}₮</div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  )
}