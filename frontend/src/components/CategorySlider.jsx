'use client'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import Link from 'next/link'
import { motion } from 'framer-motion'

import {
  MdMan, MdWoman, MdTravelExplore, MdPhoneAndroid, MdChildCare,
  MdSportsSoccer, MdSportsEsports, MdMenuBook, MdElectricalServices
} from "react-icons/md";

// Icon холбох
const categoryIcons = {
  "Эрэгтэй": MdMan,
  "Эмэгтэй": MdWoman,
  "Аялал": MdTravelExplore,
  "Гар утас": MdPhoneAndroid,
  "Хүүхэд": MdChildCare,
  "Спорт": MdSportsSoccer,
  "sport": MdSportsSoccer,
  "И-Спорт": MdSportsEsports,
  "esport": MdSportsEsports,
  "Ном": MdMenuBook,
  "book": MdMenuBook,
  "books": MdMenuBook, // ← энэ мөрийг нэмнэ үү!
  "Цахилгаан бараа": MdElectricalServices,
  "electronics": MdElectricalServices
};

// Icon өнгө холбох
const categoryColors = {
  "Эрэгтэй": "text-blue-600",
  "Эмэгтэй": "text-pink-500",
  "Аялал": "text-green-600",
  "Гар утас": "text-indigo-500",
  "Хүүхэд": "text-yellow-500",
  "Спорт": "text-red-500",
  "sport": "text-red-500",
  "И-Спорт": "text-purple-500",
  "esport": "text-purple-500",
  "Ном": "text-orange-500",
  "book": "text-orange-500",
  "Цахилгаан бараа": "text-blue-500",
  "electronics": "text-blue-500"
};

export default function CategorySlider({ categories }) {
  return (
    <div className="w-full py-6">
      <Swiper
        spaceBetween={16}
        slidesPerView={2}
        breakpoints={{
          640: { slidesPerView: 3 },
          768: { slidesPerView: 5 },
          1024: { slidesPerView: 7 },
        }}
      >
        {categories.map((cat) => {
          const Icon = categoryIcons[cat.name];
          const color = categoryColors[cat.name] || "text-gray-600";

          let path = `/category/${cat._id}`;
          if (cat.name === "Гар утас") path = "/garutas";
          if (cat.name === "Эрэгтэй") path = "/category/mens";
          if (cat.name === "Эмэгтэй") path = "/category/womens";
          if (cat.name === "Аялал") path = "/category/travel";
          if (cat.name === "Хүүхэд") path = "/category/kids";
          if (cat.name === "Спорт" || cat.name === "sport") path = "/category/sports";
          if (cat.name === "И-Спорт" || cat.name === "esport") path = "/category/esports";
          if (cat.name === "Ном" || cat.name === "book" || cat.name === "books") path = "/category/books";
          if (cat.name === "Цахилгаан бараа" || cat.name === "electronics") path = "/category/electronics";

          return (
            <SwiperSlide key={cat._id}>
              <Link href={path}>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="flex flex-col mt-3 pb-2 items-center cursor-pointer"
                >
                  <motion.div
                    whileHover={{
                      rotate: 5,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                    }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-white to-gray-100 flex items-center justify-center overflow-hidden"
                  >
                    {Icon ? (
                      <Icon className={`text-4xl ${color}`} />
                    ) : (
                      <img
                        src={cat.image || '/placeholder.png'}
                        alt={cat.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    )}
                  </motion.div>
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    className="mt-2 text-sm font-medium text-gray-700 hover:text-black text-center"
                  >
                    {cat.name}
                  </motion.span>
                </motion.div>
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  )
}
