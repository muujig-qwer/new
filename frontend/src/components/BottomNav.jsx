"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome, FaShoppingCart, FaHeart, FaUser } from "react-icons/fa";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

export default function BottomNav() {
  const pathname = usePathname();
  const { cartItems } = useCart();
  const { wishlist } = useWishlist();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-md">
      <div className="flex justify-around items-center h-14">
        <NavItem href="/" icon={FaHome} label="Нүүр" active={pathname === "/"} />
        <NavItem
          href="/cart"
          icon={FaShoppingCart}
          label="Сагс"
          count={cartItems.length}
          active={pathname === "/cart"}
        />
        <NavItem
          href="/favorites"
          icon={FaHeart}
          label="Хадгалсан"
          count={wishlist.length}
          active={pathname === "/favorites"}
        />
        <NavItem
          href="/profile"
          icon={FaUser}
          label="Профайл"
          active={pathname.startsWith("/profile")}
        />
      </div>
    </nav>
  );
}

function NavItem({ href, icon: Icon, label, count, active }) {
  return (
    <Link href={href} className="relative flex flex-col items-center text-xs text-gray-600 hover:text-green-600">
      <Icon className={`text-lg ${active ? "text-green-600" : ""}`} />
      <span className={`text-[10px] ${active ? "text-green-600" : ""}`}>{label}</span>
      {count > 0 && (
        <span className="absolute top-0 right-1 bg-red-500 text-white text-[10px] rounded-full px-1">
          {count}
        </span>
      )}
    </Link>
  );
}
