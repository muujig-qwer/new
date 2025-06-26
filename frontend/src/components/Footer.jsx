import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaTiktok,
  FaLinkedinIn,
} from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="bg-white  mt-12">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-6 gap-8">
        {/* FreshPack хэсэг */}
        <div className="md:col-span-2">
          <h3 className="font-bold text-xl mb-4">1111</h3>
          <div className="mb-4">
            <h4 className="font-semibold mb-2">1111 аппликейшн</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>App Store</li>
              <li>Google Play</li>
            </ul>
          </div>
        </div>

        {/* Компани хэсэг */}
        <div>
          <h3 className="font-bold mb-2">Компани</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>
              <a href="/company/about" className="hover:underline">
                Бидний тухай
              </a>
            </li>
            <li>Мэдээ мэдээлэл</li>
            <li>Шинжилгээ судалгаа</li>
          </ul>
        </div>

        {/* Үйлчилгээ хэсэг */}
        <div>
          <h3 className="font-bold mb-2">Үйлчилгээ</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>
              <a href="/company/support/terms" className="hover:underline">
                Үйлчилгээний нөхцөл
              </a>
            </li>
            <li>
              <a href="/company/support/faq" className="hover:underline">
                Түгээмэл асуулт & хариулт
              </a>
            </li>
            <li>
              <a href="/company/support/terms" className="hover:underline">
                Нууцлалын бодлого
              </a>
            </li>
          </ul>
        </div>

        {/* Холбоо барих хэсэг */}
        <div>
          <h3 className="font-bold mb-2">Холбоо барих</h3>
          <p className="text-sm text-gray-600">
            Бидэнтэй холбогдох, санал хүсэлтээ үлдээх эсвэл асуух зүйлээ
            бичээрэй.
          </p>
        </div>

        {/* Сошиал хэсэг */}
        <div>
          <h3 className="font-bold mb-2">Олон нийтийн сүлжээ</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>Facebook</li>
            <li>Instagram</li>
          </ul>
        </div>

        {/* Холбоо барих болон сошиал хэсэг */}
        <div className="md:col-span-6">
          <div className="border-t pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-bold mb-2">Холбоо барих</h3>
              <p className="text-sm text-gray-600">
                7777-5600
                <br />
                06:00 – 22:00 (ажлын цаг)
                <br />
                info@freshpack.mn
              </p>
            </div>

            <div className="flex items-center gap-4 text-gray-500 text-2xl">
              <a href="#" aria-label="Facebook">
                <FaFacebookF />
              </a>
              <a href="#" aria-label="Instagram">
                <FaInstagram />
              </a>
              <a href="#" aria-label="Youtube">
                <FaYoutube />
              </a>
              <a href="#" aria-label="TikTok">
                <FaTiktok />
              </a>
              <a href="#" aria-label="Linkedin">
                <FaLinkedinIn />
              </a>
            </div>

            <div className="text-right">
              <p className="text-xs text-gray-500">
                FreshPack.mn ©2025. Бүх эрх хуулиар хамгаалагдсан.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
