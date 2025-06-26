"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function AboutCompanyPage() {
  const [categoryCount, setCategoryCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    fetch("http://localhost:5000/api/categories")
      .then((res) => res.json())
      .then((data) => setCategoryCount(data.length));

    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => setProductCount(data.length));

    fetch("http://localhost:5000/api/orders")
      .then((res) => res.json())
      .then((data) => setOrderCount(data.length));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 font-montserrat">
      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden shadow-lg mb-10"
      >
        <Image
          src="/banner-about.jpg"
          alt="About Banner"
          layout="fill"
          objectFit="cover"
          className="brightness-75"
        />
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <h1 className="text-3xl md:text-5xl font-bold text-center">
            Бидний тухай
          </h1>
        </div>
      </motion.div>

      {/* Summary stats */}
      <div className="grid md:grid-cols-3 gap-6 text-center mb-10">
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-3xl font-bold text-blue-600">{categoryCount}</p>
          <p className="text-gray-700 mt-1">Ангилал</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-3xl font-bold text-green-600">{productCount}</p>
          <p className="text-gray-700 mt-1">Бараа</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-3xl font-bold text-purple-600">{orderCount}</p>
          <p className="text-gray-700 mt-1">Захиалга</p>
        </div>
      </div>

      {/* Why choose us */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="bg-white rounded-xl shadow p-6 mb-8"
      >
        <h2 className="text-xl font-bold mb-4 text-blue-700">Яагаад биднийг сонгох вэ?</h2>
        <ul className="list-disc pl-6 space-y-2 text-base text-gray-800">
          <li>Шуурхай хүргэлт — 2-4 цагт хүргэнэ</li>
          <li>Хуваарийн дагуу хүргэлт — хүссэн цагаар</li>
          <li>Бүх төрлийн бараа, нэг дор</li>
          <li>Хялбар, аюулгүй хэрэглээ</li>
          <li>Захиалгын түүх, хяналт ил тод</li>
        </ul>
      </motion.div>

      {/* Goal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        viewport={{ once: true }}
        className="bg-white rounded-xl shadow p-6"
      >
        <h2 className="text-xl font-bold mb-4 text-green-700">Бидний зорилго</h2>
        <p className="text-base text-gray-800">
          Хэрэглэгч бүрт хамгийн өргөн сонголт, найдвартай үйлчилгээ,
          хурдан шуурхай хүргэлтийг санал болгож, цахим худалдааны шилдэг платформ болохыг зорьдог.
        </p>
      </motion.div>
    </div>
  );
}
