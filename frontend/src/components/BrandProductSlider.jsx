// components/BrandProductSlider.jsx
"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Heart, Star, Clock, Home } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

export default function BrandProductSlider({ 
  brand, 
  products, 
  showViewAll = true,
  viewAllHref // энэ prop-ыг нэмнэ
}) {
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (!products || products.length === 0) return null;

  const filteredProducts = brand 
    ? products.filter(product => 
        product.brand?.toLowerCase() === brand.toLowerCase()
      )
    : products;

  if (filteredProducts.length === 0) return null;

  return (
    <div className="w-full py-8 relative">
      {/* Products Slider */}
      <div className="relative">
        <Swiper
          modules={[Navigation]}
          spaceBetween={16}
          slidesPerView={1}
          navigation={{
            prevEl: `.swiper-button-prev-${brand}`,
            nextEl: `.swiper-button-next-${brand}`,
          }}
          breakpoints={{
            480: { slidesPerView: 2, spaceBetween: 16 },
            768: { slidesPerView: 3, spaceBetween: 20 },
            1024: { slidesPerView: 4, spaceBetween: 24 },
            1280: { slidesPerView: 5, spaceBetween: 24 },
            1536: { slidesPerView: 6, spaceBetween: 24 },
          }}
          className="brand-product-slider"
        >
          {filteredProducts.map((product, index) => {
            const isWished = wishlist.some((p) => p._id === product._id);
            return (
              <SwiperSlide key={`${product._id}-${index}`}>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-lg transition-all duration-300">
                  {/* Product Image + Wishlist */}
                  <div className="relative aspect-square bg-gray-50 overflow-hidden cursor-pointer">
                    <Link href={`/products/${product._id}`}>
                      <img
                        src={
                          product.images && product.images.length > 0
                            ? product.images[0]
                            : product.image
                            ? product.image
                            : "/placeholder.png"
                        }
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>

                    {/* Discount badge */}
                    {product.discount && product.discountPrice && (
                      <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded shadow z-10">
                        -{product.discount}%
                      </span>
                    )}

                    {/* Installment Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1" style={{ left: product.discount && product.discountPrice ? '3.5rem' : '0.75rem' }}>
                      <span className="bg-teal-500 text-white text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                        <span className="text-[10px]">⚡</span>
                        М
                      </span>
                    </div>

                    {/* Wishlist Button */}
                    <button
                      className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
                      onClick={() =>
                        isWished
                          ? removeFromWishlist(product._id)
                          : addToWishlist(product)
                      }
                    >
                      <Heart
                        size={16}
                        className={isWished ? "text-red-500" : "text-gray-400"}
                        fill={isWished ? "red" : "none"}
                      />
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    {/* Price & Discount */}
                    <div className="mb-2">
                      {product.discount && product.discountPrice ? (
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-end gap-1">
                            <span className="text-lg font-bold text-green-700">
                              {product.discountPrice?.toLocaleString()}₮
                            </span>
                            <span className="line-through text-gray-400 text-xs font-semibold">
                              {product.price?.toLocaleString()}₮
                            </span>
                            <span className="ml-1 px-1 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded">
                              -{product.discount}%
                            </span>
                          </div>
                          
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-gray-900">
                          {product.price?.toLocaleString()}₮
                        </span>
                      )}
                    </div>

                    {/* Product Name */}
                    <Link href={`/products/${product._id}`}>
                      <h3 className="font-medium text-gray-800 text-sm line-clamp-2 hover:text-blue-600 transition-colors leading-relaxed cursor-pointer">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Product Details */}
                    {product.specifications && (
                      <p className="text-xs text-gray-500 line-clamp-1">
                        {product.specifications}
                      </p>
                    )}

                    {/* Add to Cart Button */}
                    <button
                      className="w-full bg-blue-600 text-white py-2 rounded mt-2 hover:bg-blue-700 transition"
                      onClick={() => addToCart(product)}
                    >
                      🛒 Сагслах
                    </button>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>

        {/* Custom Navigation Buttons */}
        <button className={`swiper-button-prev-${brand} absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:shadow-xl transition-shadow`}>
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <button className={`swiper-button-next-${brand} absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:shadow-xl transition-shadow`}>
          <ChevronRight size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        .brand-product-slider .swiper-slide {
          height: auto;
        }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .swiper-button-prev-${brand}:hover,
        .swiper-button-next-${brand}:hover {
          transform: translateY(-50%) scale(1.05);
        }
        .swiper-button-prev-${brand}.swiper-button-disabled,
        .swiper-button-next-${brand}.swiper-button-disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}