"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  FaMale,
  FaFemale,
  FaChild,
  FaBoxOpen,
  FaShoppingCart,
  FaClipboardList,
  FaUser,
  FaSignInAlt,
  FaUserPlus,
  FaSignOutAlt,
  FaTachometerAlt,
  FaBoxes,
  FaBars,
  FaTimes,
  FaSearch,
  FaHeart,
  FaBell,
  FaMapMarkerAlt,
  FaChevronDown,
  FaUtensils,
  FaShirt,
  FaGamepad,
  FaHome,
  FaCoffee,
  FaBook,
  FaGift,
  FaApple,
  FaTshirt,
  FaLeaf,
  FaPhone,
  FaTripadvisor,
  FaBasketballBall,
} from "react-icons/fa";
import { useSession, signOut } from "next-auth/react";
import { useWishlist } from "@/context/WishlistContext";

function CategoryIcon({ icon: Icon, label, href, isActive = false }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 hover:bg-gray-100 ${
        isActive ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:text-gray-800"
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { wishlist } = useWishlist();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isAdmin = session?.user?.email === "muujig165@gmail.com";
  const userName = session?.user?.name || "";
  const userRole = session?.role || (session?.user?.role ?? "");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const categories = [
    { icon: FaMale, label: "Эрэгтэй", href: "/category/mens", key: "mensneaker" },
    { icon: FaFemale, label: "Эмэгтэй", href: "/category/womens", key: "womensneaker" },
    { icon: FaTripadvisor, label: "Аялал", href: "/category/travel", key: "travel" },
    { icon: FaPhone, label: "Гар Утас", href: "/garutas", key: "garutas" },
    { icon: FaChild, label: "Хүүхэд", href: "/category/kids", key: "kids" },
    { icon: FaBasketballBall, label: "Спорт", href: "/category/sports", key: "sports" },
    { icon: FaGamepad, label: "И-Спорт", href: "/category/esports", key: "esports" },
    { icon: FaBook, label: "Ном", href: "/category/books", key: "books" }
  ];

  return (
    <div className="relative w-full">
      {/* Main Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          {/* Top Row */}
          <div className="flex items-center justify-between h-16">
            {/* Left Section - Mobile Menu + Logo */}
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {menuOpen ? (
                  <FaTimes className="h-5 w-5 text-gray-600" />
                ) : (
                  <FaBars className="h-5 w-5 text-gray-600" />
                )}
              </button>

              {/* Logo */}
              <Link
                href="/"
                className="text-2xl font-bold text-green-600 hover:text-green-700 transition-colors"
              >
                11111
              </Link>
            </div>

            {/* Center Section - Search Bar (Desktop) */}
            <div className="flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="hidden md:flex">
                <div className="relative w-full">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Дэлгүүр хайх"
                    className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-green-600 transition-colors"
                  >
                    <FaSearch className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </div>

            {/* Right Section - Location + Navigation Icons */}
            <div className="flex items-center gap-6">
              {/* Location (Desktop) */}
              <div className="hidden lg:flex items-center text-sm text-gray-600 cursor-pointer hover:text-gray-800 transition-colors">
                <FaMapMarkerAlt className="h-4 w-4 mr-2" />
                <span>Сүхбаатрын талбай...</span>
                <FaChevronDown className="h-3 w-3 ml-1" />
              </div>

              {/* Navigation Icons */}
              <div className="flex items-center gap-3">
                {/* Desktop Icons */}
                <div className="hidden md:flex items-center gap-3">
                  {session ? (
                    <>
                      {!isAdmin && (
                        <>
                          <Link href="/cart" className="p-2 text-gray-600 hover:text-green-600 transition-colors">
                            <FaShoppingCart className="h-5 w-5" />
                          </Link>
                          <Link href="/orders" className="p-2 text-gray-600 hover:text-green-600 transition-colors">
                            <FaClipboardList className="h-5 w-5" />
                          </Link>
                        </>
                      )}
                      <Link href="/favorites" className="relative p-2 text-gray-600 hover:text-green-600 transition-colors">
                        <FaHeart className="h-5 w-5" />
                        {wishlist.length > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
                            {wishlist.length}
                          </span>
                        )}
                      </Link>
                      <Link href="/notifications" className="p-2 text-gray-600 hover:text-green-600 transition-colors">
                        <FaBell className="h-5 w-5" />
                      </Link>
                      <Link href="/profile" className="p-2 text-gray-600 hover:text-green-600 transition-colors">
                        <FaUser className="h-5 w-5" />
                      </Link>
                      {isAdmin && (
                        <>
                          <Link href="/admin/dashboard" className="p-2 text-gray-600 hover:text-green-600 transition-colors">
                            <FaTachometerAlt className="h-5 w-5" />
                          </Link>
                          <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                            Админ
                          </span>
                        </>
                      )}
                      <button
                        onClick={handleLogout}
                        className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                      >
                        <FaSignOutAlt className="h-5 w-5" />
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Link
                        href="/login"
                        className="px-4 py-2 text-green-600 hover:text-green-700 font-medium transition-colors"
                      >
                        Нэвтрэх
                      </Link>
                      <Link
                        href="/register"
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                      >
                        Бүртгүүлэх
                      </Link>
                    </div>
                  )}
                </div>

                {/* Mobile Icons */}
                <div className="flex md:hidden items-center gap-2">
                  <button className="p-2 text-gray-600 hover:text-green-600 transition-colors">
                    <FaSearch className="h-5 w-5" />
                  </button>
                  {session && (
                    <Link href="/cart" className="p-2 text-gray-600 hover:text-green-600 transition-colors">
                      <FaShoppingCart className="h-5 w-5" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Categories Row */}
          <div className="border-t border-gray-100 py-4">
            <div className="flex items-center justify-between">
              {/* All Categories Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
                >
                  <FaBoxes className="h-4 w-4" />
                  <span className="font-medium">Бүх ангилал</span>
                  <FaChevronDown className="h-4 w-4 ml-1" />
                </button>
                {dropdownOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    {categories.map((category) => (
                      <CategoryIcon
                        key={category.key}
                        icon={category.icon}
                        label={category.label}
                        href={category.href}
                        isActive={pathname.startsWith(category.href)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Right side spacing/alignment helper */}
              <div className="flex-1"></div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden transition-all duration-300 overflow-hidden ${
            menuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-4 py-6 border-t border-gray-100 bg-gray-50">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Дэлгүүр хайх"
                  className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-400"
                >
                  <FaSearch className="h-4 w-4" />
                </button>
              </div>
            </form>

            {/* Mobile Navigation */}
            <div className="space-y-4">
              {session ? (
                <>
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-white transition-colors"
                  >
                    <FaUser className="h-5 w-5 text-gray-600" />
                    <span>Профайл</span>
                  </Link>
                  {!isAdmin && (
                    <>
                      <Link
                        href="/cart"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-white transition-colors"
                      >
                        <FaShoppingCart className="h-5 w-5 text-gray-600" />
                        <span>Сагс</span>
                      </Link>
                      <Link
                        href="/orders"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-white transition-colors"
                      >
                        <FaClipboardList className="h-5 w-5 text-gray-600" />
                        <span>Миний захиалгууд</span>
                      </Link>
                    </>
                  )}
                  <Link
                    href="/favorites"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-white transition-colors"
                  >
                    <FaHeart className="h-5 w-5 text-gray-600" />
                    <span>Дуртай</span>
                  </Link>
                  {isAdmin && (
                    <>
                      <Link
                        href="/admin/dashboard"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-white transition-colors"
                      >
                        <FaTachometerAlt className="h-5 w-5 text-gray-600" />
                        <span>Админ самбар</span>
                      </Link>
                      <Link
                        href="/admin/orders"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-white transition-colors"
                      >
                        <FaClipboardList className="h-5 w-5 text-gray-600" />
                        <span>Захиалгууд</span>
                      </Link>
                    </>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-white transition-colors w-full text-left text-red-600"
                  >
                    <FaSignOutAlt className="h-5 w-5" />
                    <span>Гарах</span>
                  </button>
                </>
              ) : (
                <div className="space-y-3">
                  <Link
                    href="/login"
                    className="block w-full p-3 text-center border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                  >
                    Нэвтрэх
                  </Link>
                  <Link
                    href="/register"
                    className="block w-full p-3 text-center bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Бүртгүүлэх
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}