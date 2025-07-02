"use client";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useNotification } from "@/context/NotificationContext";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Heart } from "lucide-react";

export default function FavoritesPage() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showNotification, notif } = useNotification(); // notification context-оос авна
  const { data: session } = useSession();

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto py-10 px-4">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white rounded-xl shadow p-6 space-y-4 text-sm">
        <p className="text-gray-400">Нүүр хуудас · <span className="text-black font-medium">Хүслийн жагсаалт</span></p>

        <nav className="flex flex-col gap-3 mt-4">
          <Link href="/profile" className="flex items-center gap-2 text-gray-700 hover:text-black">
            <span>👤</span> Миний мэдээлэл
          </Link>
          <Link href="#" className="flex items-center gap-2 text-gray-700 hover:text-black">
            <span>📁</span> Хэтэвч
          </Link>
          <Link href="/orders" className="flex items-center gap-2 text-gray-700 hover:text-black">
            <span>📦</span> Миний захиалгууд
          </Link>
          <Link href="#" className="flex items-center gap-2 text-green-600 font-medium">
            <span>💚</span> Хүслийн жагсаалт
          </Link>
          <Link href="#" className="flex items-center gap-2 text-gray-700 hover:text-black">
            <span>🔗</span> И-баримт холбох
          </Link>
          <Link href="#" className="flex items-center gap-2 text-gray-700 hover:text-black">
            <span>🔒</span> Нууц үг солих
          </Link>
          <Link href="/company/support/faq" className="flex items-center gap-2 text-gray-700 hover:text-black">
            <span>❓</span> Тусламж
          </Link>
          <Link href="/" className="flex items-center gap-2 text-gray-700 hover:text-black">
            <span>🚪</span> Гарах
          </Link>
        </nav>
      </aside>

      {/* Wishlist */}
      <section className="flex-1 bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">Хүслийн жагсаалт</h1>
        </div>

        {wishlist.length === 0 ? (
          <p className="text-gray-500">Хүслийн жагсаалт хоосон байна.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {wishlist.map((product) => (
              <div
                key={product._id}
                className="bg-gray-50 rounded-xl p-4 relative shadow hover:shadow-md transition"
              >
                {/* Wishlist heart */}
                <button
                  onClick={() => removeFromWishlist(product._id)}
                  className="absolute top-3 right-3"
                >
                  <Heart size={18} className="text-red-500 fill-red-500" />
                </button>

                {/* Product Image */}
                <img
                  src={
                    product.images?.[0]?.startsWith("http")
                      ? product.images[0]
                      : `http://localhost:5000/uploads/${product.images?.[0]}`
                  }
                  alt={product.name}
                  className="w-full aspect-square object-cover rounded mb-3"
                />

                {/* Product Name */}
                <h2 className="text-sm font-medium line-clamp-2 mb-1">
                  {product.name}
                </h2>

                {/* Price */}
                <p className="text-gray-700 font-semibold text-sm mb-2">
                  {product.price?.toLocaleString()}₮
                </p>

                {/* Add to Cart Button */}
                <button
                  className="w-full border bg-white text-sm py-2 rounded hover:bg-blue-50 transition"
                  onClick={() => {
                    addToCart({ ...product, quantity: 1 });
                    showNotification(product); 
                  }}
                >
                  🛒 Сагслах
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
