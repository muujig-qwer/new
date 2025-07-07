"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useMemo } from "react";
import {
  FaChartBar,
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
import { useCart } from "@/context/CartContext"; // Cart context-оо импортлоорой
import dynamic from "next/dynamic";

// Leaflet болон react-leaflet-ийг динамикаар импортлох (SSR-гүй)

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

function CategoryIcon({ icon: Icon, label, href, isActive = false }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 hover:bg-gray-100 ${
        isActive
          ? "bg-blue-50 text-blue-600"
          : "text-gray-600 hover:text-gray-800"
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
  const { cartItems = [] } = useCart(); // cart context-оос cartItems авна
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [location, setLocation] = useState("Сүхбаатрын талбай...");
  const [mapPosition, setMapPosition] = useState([47.918873, 106.917701]); // default: Ulaanbaatar
  const [showMap, setShowMap] = useState(false);
  const [tempPosition, setTempPosition] = useState(mapPosition); // Түр хадгалах байршил
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notifRef = useRef();

  const isAdmin = session?.user?.email === "muujig165@gmail.com";
  const userName = session?.user?.name || "";
  const userRole = session?.role || (session?.user?.role ?? "");

  // Нийт үнэ тооцоолох
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );

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

  // Байршил авах функц (OpenStreetMap + Leaflet)
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocation("Таны төхөөрөмж байршил дэмжихгүй байна");
      return;
    }
    setLocation("Байршил тодорхойлж байна...");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setMapPosition([latitude, longitude]);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=mn`
          );
          const data = await res.json();
          const address = data.address;
          const sum = address.suburb || address.town || address.village || "";
          const duureg =
            address.city_district || address.county || address.state || "";
          setLocation(
            [sum, duureg].filter(Boolean).join(", ") ||
              "Байршил тодорхойлогдсонгүй"
          );
        } catch {
          setLocation("Байршил тодорхойлох боломжгүй байна");
        }
      },
      () => {
        setLocation("Байршил авах боломжгүй байна");
      }
    );
  };

  // Газрын зураг дээр маркерийг чирж өөрчлөх функц
  const handleMarkerDrag = (e) => {
    const { lat, lng } = e.target.getLatLng();
    setTempPosition([lat, lng]);
  };

  // Popup-оос байршлыг батлах
  const handleConfirmLocation = async () => {
    setMapPosition(tempPosition);
    setShowMap(false);
    setLocation("Байршил тодорхойлж байна...");
    try {
      const [latitude, longitude] = tempPosition;
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=mn`
      );
      const data = await res.json();
      const address = data.address;
      // Илүү дэлгэрэнгүй хаяг бүрдүүлэх
      const details = [
        address.road, // Гудамж
        address.house_number, // Байрны дугаар
        address.suburb, // Дэд хороолол/хороо
        address.city_district || address.county || address.state, // Дүүрэг
        address.city || address.town || address.village,
      ]
        .filter(Boolean)
        .join(", ");
      setLocation(details || "Байршил тодорхойлогдсонгүй");
    } catch {
      setLocation("Байршил тодорхойлох боломжгүй байна");
    }
  };

  const categories = [
    {
      icon: FaMale,
      label: "Эрэгтэй",
      href: "/category/mens",
      key: "mensneaker",
    },
    {
      icon: FaFemale,
      label: "Эмэгтэй",
      href: "/category/womens",
      key: "womensneaker",
    },
    {
      icon: FaTripadvisor,
      label: "Аялал",
      href: "/category/travel",
      key: "travel",
    },
    { icon: FaPhone, label: "Гар Утас", href: "/garutas", key: "garutas" },
    { icon: FaChild, label: "Хүүхэд", href: "/category/kids", key: "kids" },
    {
      icon: FaBasketballBall,
      label: "Спорт",
      href: "/category/sports",
      key: "sports",
    },
    {
      icon: FaGamepad,
      label: "И-Спорт",
      href: "/category/esports",
      key: "esports",
    },
    { icon: FaBook, label: "Ном", href: "/category/books", key: "books" },
  ];

  // Custom icon-ыг зөвхөн client дээр үүсгэнэ
  const customIcon = useMemo(() => {
    if (typeof window === "undefined") return null;
    // L-ийг динамикаар импортлох
    const L = require("leaflet");
    return new L.Icon({
      iconUrl: "/icons/my-marker.png", // өөрийн icon path
      iconSize: [32, 32], // icon хэмжээ
      iconAnchor: [16, 32], // icon-ийн суурь цэг
      popupAnchor: [0, -32],
      shadowUrl: null,
    });
  }, []);

  useEffect(() => {
    // Байршил өөрчлөгдөх бүрт localStorage-д хадгална
    if (location && location !== "Сүхбаатрын талбай...") {
      localStorage.setItem("user_location", location);
    }
  }, [location]);

  // Жишээ notification fetch (API-г өөрийнхөөрөө солиорой)
  useEffect(() => {
    if (!session) return;
    fetch("http://localhost:5000/api/notifications", {
      headers: {
        Authorization: `Bearer ${session?.accessToken}`, // protect middleware-д токен дамжуулна
      },
    })
      .then((res) => res.json())
      .then((data) => setNotifications(data.notifications || []));
  }, [session]);

  // Dropdown outside click хаах
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifOpen]);

  // Уншаагүй мэдэгдлийн тоо
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Мэдэгдэл нээхэд бүх мэдэгдлийг уншсан болгож сервер рүү илгээх
  const handleNotifOpen = async () => {
    setNotifOpen((v) => !v);
    if (!notifOpen && unreadCount > 0) {
      // PUT эсвэл POST хүсэлтээр бүх мэдэгдлийг уншсан болгож серверт илгээнэ
      await fetch("http://localhost:5000/api/notifications/mark-all-read", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      // Local state-ийг шинэчилнэ
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

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

            {/* Center Section - Search Bar (Desktop & Mobile) */}
            <div className="flex-1 max-w-2xl mx-8 md:mx-4">
              <form onSubmit={handleSearch} className="flex w-full">
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
              {/* Location (Desktop Only) */}
              <div
                className="hidden lg:flex items-center text-sm text-gray-600 cursor-pointer hover:text-gray-800 transition-colors"
                onClick={() => setShowMap(true)}
                title="Байршлаа шинэчлэх"
              >
                <FaMapMarkerAlt className="h-4 w-4 mr-2" />
                <span>{location}</span>
                <FaChevronDown className="h-3 w-3 ml-1" />
              </div>

              {/* Popup/modal дотор газрын зураг - Байршил сонгох */}
              {showMap && MapContainer && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                  <div
                    className="bg-white rounded-lg shadow-lg p-4 relative"
                    style={{ width: 400, height: 340 }}
                  >
                    <button
                      className="absolute top-2 right-2 text-gray-600 hover:text-red-600"
                      onClick={() => setShowMap(false)}
                    >
                      ×
                    </button>
                    <MapContainer
                      center={tempPosition}
                      zoom={13}
                      scrollWheelZoom={false}
                      style={{ width: "100%", height: "250px" }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      {customIcon && (
                        <Marker
                          position={tempPosition}
                          draggable={true}
                          icon={customIcon}
                          eventHandlers={{
                            dragend: handleMarkerDrag,
                          }}
                        >
                          <Popup>Маркерийг чирж байршлаа сонгоно уу</Popup>
                        </Marker>
                      )}
                    </MapContainer>
                    <button
                      className="mt-3 w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      onClick={handleConfirmLocation}
                    >
                      Байршлыг батлах
                    </button>
                  </div>
                </div>
              )}

              {/* Navigation Icons (Desktop & Mobile) */}
              <div className="flex items-center gap-3">
                {session ? (
                  <>
                    {!isAdmin && (
                      <>
                        {/* Cart icon хэсэг */}
                        <Link
                          href="/cart"
                          className={`relative p-2 rounded-2xl transition-colors min-w-[40px] flex justify-center items-center
                            bg-white
                            ${
                              cartItems.length === 0
                                ? "text-gray-600"
                                : "text-black"
                            }
                          `}
                        >
                          {cartItems.length === 0 ? (
                            // Cart хоосон үед саарал icon
                            <FaShoppingCart className="h-5 w-5" />
                          ) : (
                            // Cart-д бүтээгдэхүүн байгаа үед нийт үнэ харуулах (хар текст)
                            <span className="text-xs font-semibold select-none">
                              Нийт үнэ: {cartTotal.toLocaleString()}₮
                            </span>
                          )}
                        </Link>
                      </>
                    )}
                    <Link
                      href="/favorites"
                      className="relative p-2 text-gray-600 hover:text-green-600 transition-colors hidden lg:flex" // ← энэ нэмэлт
                    >
                      <FaHeart className="h-5 w-5" />
                      {wishlist.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
                          {wishlist.length}
                        </span>
                      )}
                    </Link>

                    {/* Notification dropdown button - Link-ийг button болгож, dropdown харуулна */}
                    <div className="relative" ref={notifRef}>
                      <button
                        type="button"
                        className="p-2 text-gray-600 hover:text-green-600 transition-colors relative"
                        onClick={handleNotifOpen}
                      >
                        <FaBell className="h-5 w-5" />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
                            {unreadCount}
                          </span>
                        )}
                      </button>
                      {notifOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-30 max-h-96 overflow-y-auto">
                          <div className="p-3 border-b font-semibold text-gray-700">
                            Мэдэгдэл
                          </div>
                          {notifications.length === 0 ? (
                            <div className="p-4 text-gray-400 text-sm text-center">
                              Мэдэгдэл алга байна
                            </div>
                          ) : (
                            <ul>
                              {notifications.map((notif, idx) => (
                                <li
                                  key={idx}
                                  className="px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 text-sm cursor-pointer"
                                  onClick={() => {
                                    // Захиалгатай холбоотой мэдэгдэл үү гэдгийг шалгах (жишээ: title эсвэл төрөл)
                                    if (
                                      notif.title
                                        ?.toLowerCase()
                                        .includes("захиалга") ||
                                      notif.body
                                        ?.toLowerCase()
                                        .includes("захиалга")
                                    ) {
                                      setNotifOpen(false);
                                      router.push("/orders");
                                    }
                                  }}
                                >
                                  <div className="font-medium text-gray-800">
                                    {notif.title || "Мэдэгдэл"}
                                  </div>
                                  <div className="text-gray-600">
                                    {notif.body || notif.message}
                                  </div>
                                  <div className="text-xs text-gray-400 mt-1">
                                    {notif.date
                                      ? new Date(notif.date).toLocaleString()
                                      : ""}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                    <Link
                      href="/profile"
                      className="p-2 text-gray-600 hover:text-green-600 transition-colors hidden lg:flex" // ← энэ нэмэлт
                    >
                      <FaUser className="h-5 w-5" />
                    </Link>
                    {isAdmin && (
                      <>
                        <Link
                          href="/admin/dashboard"
                          className="p-2 text-gray-600 hover:text-green-600 transition-colors"
                        >
                          <FaTachometerAlt className="h-5 w-5" />
                        </Link>
                        <Link
                          href="/admin/coupons"
                          className="p-2 text-gray-600 hover:text-green-600 transition-colors"
                        >
                          <FaGift className="h-5 w-5" />
                          <span className="ml-1"></span>
                        </Link>
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          Админ
                        </span>
                      </>
                    )}
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
            {/* Mobile Search - Already handled in main nav, but keeping for consistency if needed */}
            {/* <form onSubmit={handleSearch} className="mb-6">
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
            </form> */}

            {/* Mobile Navigation */}
            <div className="space-y-4">
              {session ? (
                <>
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-white transition-colors"
                    onClick={() => setMenuOpen(false)} // Close menu on click
                  >
                    <FaUser className="h-5 w-5 text-gray-600" />
                    <span>Профайл</span>
                  </Link>
                  {!isAdmin && (
                    <>
                      <Link
                        href="/cart"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-white transition-colors"
                        onClick={() => setMenuOpen(false)}
                      >
                        <FaShoppingCart className="h-5 w-5 text-gray-600" />
                        <span>Сагс</span>
                      </Link>
                      <Link
                        href="/orders"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-white transition-colors"
                        onClick={() => setMenuOpen(false)}
                      >
                        <FaClipboardList className="h-5 w-5 text-gray-600" />
                        <span>Миний захиалгууд</span>
                      </Link>
                    </>
                  )}
                  <Link
                    href="/favorites"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-white transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <FaHeart className="h-5 w-5 text-gray-600" />
                    <span>Дуртай</span>
                  </Link>
                  {isAdmin && (
                    <>
                      <Link
                        href="/admin/dashboard"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-white transition-colors"
                        onClick={() => setMenuOpen(false)}
                      >
                        <FaTachometerAlt className="h-5 w-5 text-gray-600" />
                        <span>Админ самбар</span>
                      </Link>
                      <Link
                        href="/admin/orders"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-white transition-colors"
                        onClick={() => setMenuOpen(false)}
                      >
                        <FaClipboardList className="h-5 w-5 text-gray-600" />
                        <span>Захиалгууд</span>
                      </Link>
                      <Link
                        href="/admin/coupons"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-white transition-colors"
                        onClick={() => setMenuOpen(false)}
                      >
                        <FaGift className="h-5 w-5 text-gray-600" />
                        <span>Купон үүсгэх</span>
                      </Link>
                      <Link
                        href="/admin/reports"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-white transition-colors"
                        onClick={() => setMenuOpen(false)}
                      >
                        <FaChartBar className="h-5 w-5 text-gray-600" />
                        <span>Тайлан</span>
                      </Link>
                    </>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                    }}
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
                    onClick={() => setMenuOpen(false)}
                  >
                    Нэвтрэх
                  </Link>
                  <Link
                    href="/register"
                    className="block w-full p-3 text-center bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    onClick={() => setMenuOpen(false)}
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
