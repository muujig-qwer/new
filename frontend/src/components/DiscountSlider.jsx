// components/DiscountSlider.jsx
"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext"; // cart context байгаа бол
import { useNotification } from "@/context/NotificationContext";

export default function DiscountSlider({ products }) {
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showNotification } = useNotification();

  // Хямдрал идэвхтэй эсэхийг шалгах функц
  const isDiscountActive = (product) => {
    if (!product.discountExpires) return true;
    return new Date(product.discountExpires) > new Date();
  };

  // Зөвхөн идэвхтэй хямдралтай бараануудыг шүүнэ
  const discountedProducts = products
    ? products.filter(
        (p) =>
          p.discount &&
          p.discountPrice &&
          isDiscountActive(p)
      )
    : [];

  if (!discountedProducts || discountedProducts.length === 0)
    return (
      <div className="w-full py-8 text-center text-gray-400 text-lg font-semibold">
        Одоогоор идэвхтэй хямдралтай бараа байхгүй байна.
      </div>
    );

  return (
    <div className="w-full py-8 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          Алдаж болохгүй хямдралууд
          <span className="text-red-500">🏷️</span>
        </h2>
        <Link href="/discounts" className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
          Бүгд
          <ChevronRight size={16} />
        </Link>
      </div>

      {/* Swiper Container */}
      <div className="relative">
        <Swiper
          modules={[Navigation]}
          spaceBetween={16}
          slidesPerView={1}
          navigation={{
            prevEl: '.swiper-button-prev-custom',
            nextEl: '.swiper-button-next-custom',
          }}
          breakpoints={{
            480: { slidesPerView: 2, spaceBetween: 16 },
            768: { slidesPerView: 3, spaceBetween: 20 },
            1024: { slidesPerView: 4, spaceBetween: 24 },
            1280: { slidesPerView: 5, spaceBetween: 24 },
            1536: { slidesPerView: 6, spaceBetween: 24 },
          }}
          className="discount-slider"
        >
          {discountedProducts.map((product) => {
            const isWished = wishlist.some((p) => p._id === product._id);
            return (
              <SwiperSlide key={product._id}>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-lg transition-all duration-300">
                  {/* Product Image + Link */}
                  <Link href={`/products/${product._id}`}>
                    <div className="relative aspect-square bg-gray-50 overflow-hidden cursor-pointer">
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
                      {/* Discount Badge */}
                      {product.discount && (
                        <div className="absolute top-3 left-3 flex items-center gap-1">
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                            -{product.discount}%
                          </span>
                          <span className="bg-teal-500 text-white text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                            <span className="text-[10px]">⚡</span>
                            М
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>

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

                  {/* Product Info */}
                  <div className="p-4">
                    {/* Price */}
                    <div className="mb-2">
                      {product.discountPrice ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-gray-900">
                              {product.discountPrice.toLocaleString()}₮
                            </span>
                            <span className="line-through text-gray-400 text-sm">
                              {product.price?.toLocaleString()}₮
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
                    {/* Add to Cart Button */}
                    <button
                      className="w-full bg-blue-600 text-white py-2 rounded mt-2 hover:bg-blue-700 transition"
                      onClick={() => {
                        addToCart(product);
                        showNotification(product); // notification харуулах
                      }}
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
        <button className="swiper-button-prev-custom absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:shadow-xl transition-shadow">
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <button className="swiper-button-next-custom absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:shadow-xl transition-shadow">
          <ChevronRight size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        .discount-slider .swiper-slide {
          height: auto;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .swiper-button-prev-custom:hover,
        .swiper-button-next-custom:hover {
          transform: translateY(-50%) scale(1.05);
        }
        
        .swiper-button-prev-custom.swiper-button-disabled,
        .swiper-button-next-custom.swiper-button-disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}