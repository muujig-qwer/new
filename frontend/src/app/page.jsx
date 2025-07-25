"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import FeaturedCarousel from "@/components/FeaturedCarousel";
import CategorySlider from "@/components/CategorySlider";
import DiscountSlider from "@/components/DiscountSlider";
import BrandProductSlider from "@/components/BrandProductSlider";
import { useWishlist } from "@/context/WishlistContext";

const categorySliders = [
  { id: "685a77b1a79b80fa8a74a637", name: "Цахилгаан бараа" },
  { id: "684f88e63756ab9fdd1a7807", name: "Эрэгтэй Пүүз" },
  { id: "684fa4b73756ab9fdd1a787d", name: "Эмэгтэй пүүз" },
  { id: "685b7811351e642bb82c6c4e", name: "Гар утас" },
];

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [openParent, setOpenParent] = useState(null);
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/categories")
      .then((res) => setCategories(res.data));
    axios
      .get("http://localhost:5000/api/products?featured=true")
      .then((res) => setFeaturedProducts(res.data.products || []));
    axios
      .get("http://localhost:5000/api/products")
      .then((res) => setAllProducts(res.data.products || []));
  }, []);

  const parentCategories = categories.filter((cat) => !cat.parent);
  const getChildCategories = (parentId) =>
    categories.filter((cat) => cat.parent === parentId);

  const discountedProducts = featuredProducts.filter(
    (p) => p.discount && p.discountPrice
  );

  const featuredCategoryId = "685a77b1a79b80fa8a74a637";
  const featuredCategoryProducts = featuredProducts.filter(
    (p) =>
      p.category === featuredCategoryId ||
      p.category?._id === featuredCategoryId
  );

  const getProductsByCategory = (catId) => {
    const subCategoryIds = categories
      .filter((cat) => cat.parent === catId)
      .map((cat) => cat._id);

    return allProducts.filter((p) => {
      const categoryId =
        typeof p.category === "object" && p.category !== null && p.category._id
          ? p.category._id.toString()
          : p.category?.toString?.() || p.category;
      return categoryId === catId || subCategoryIds.includes(categoryId);
    });
  };

  return (
  <div className="text-gray-800 font-montserrat">
    {/* Featured Carousel */}
    <section className="max-w-7xl mx-auto px-4 pt-4 sm:pt-6">
      <FeaturedCarousel products={featuredProducts} />
    </section>

    {/* Discount Slider */}
    <section className="max-w-7xl mx-auto px-4 pt-4 sm:pt-0 bg-white rounded-xl shadow mt-4">
      <DiscountSlider products={discountedProducts} />
    </section>

    {/* Category Slider */}
    <section className="max-w-7xl mx-auto px-4 pt-4 sm:pt-0 mt-4">
      <CategorySlider categories={parentCategories} />
    </section>

    {/* Category-wise Sliders */}
    {categorySliders.map((cat) => {
      const products = getProductsByCategory(cat.id);
      if (!products.length) return null;
      return (
        <section
          key={cat.id}
          className="max-w-7xl mx-auto px-4 pt-4 sm:pt-0 mt-4 bg-white rounded-xl shadow"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 sm:mb-4 gap-2 sm:gap-4">
            <h2 className="text-base sm:text-xl font-bold">{cat.name}</h2>
            <Link
              href={
                cat.name === "Гар утас"
                  ? "/garutas"
                  : cat.name === "Цахилгаан бараа"
                  ? "/category/electronics"
                  : cat.name === "Эрэгтэй Пүүз"
                  ? "/category/mens"
                  : cat.name === "Эмэгтэй пүүз"
                  ? "/category/womens"
                  : "#"
              }
              className="text-sm text-blue-500 hover:underline"
            >
              Бүгд
            </Link>
          </div>
          <BrandProductSlider products={products} showViewAll={true} />
        </section>
      );
    })}
  </div>
);

}
