'use client'

import { Phone, MessageCircle, Clock, MapPin, Mail, Users } from 'lucide-react'

export default function AboutPage() {
 return (
   <div className="min-h-screen bg-gradient-to-br pt-10 from-slate-900 via-purple-900 to-slate-900">
     {/* Hero Section */}
     <div className="relative overflow-hidden">
       <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
       <div className="relative max-w-6xl mx-auto px-6 py-24">
         <div className="text-center">
           <h1 className="text-5xl md:text-7xl font-bold mb-8 text-white">
             Бидний тухай
           </h1>
           <div className="max-w-4xl mx-auto space-y-6">
             <p className="text-xl md:text-2xl leading-relaxed text-gray-200">
               Манай дэлгүүр нь орчин үеийн хэв маяг, чанар, тав тухыг нэгтгэсэн, 
               байгальд ээлтэй бүтээгдэхүүнүүдийг санал болгодог.
             </p>
             <p className="text-lg md:text-xl leading-relaxed text-gray-300">
               Хэрэглэгч бүрийн хэрэгцээнд нийцсэн гутал, хувцас, гэр ахуйн бараа зэрэг 
               олон төрлийн бүтээгдэхүүнийг танд хүргэнэ.
             </p>
             <p className="text-lg md:text-xl leading-relaxed text-gray-300">
               Бидний эрхэм зорилго бол сэтгэл ханамж, итгэлцэл, чанарыг нэг дор хүргэх юм.
             </p>
           </div>
         </div>
       </div>
     </div>

     {/* Stats Section */}
     <div className="py-16 bg-white/5 backdrop-blur-sm">
       <div className="max-w-6xl mx-auto px-6">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
           <div className="p-6">
             <Users className="w-12 h-12 text-blue-400 mx-auto mb-4" />
             <h3 className="text-3xl font-bold text-white mb-2">10,000+</h3>
             <p className="text-gray-300">Сэтгэл хангалуун үйлчлүүлэгч</p>
           </div>
           <div className="p-6">
             <MapPin className="w-12 h-12 text-purple-400 mx-auto mb-4" />
             <h3 className="text-3xl font-bold text-white mb-2">50+</h3>
             <p className="text-gray-300">Хүргэлтийн цэг</p>
           </div>
           <div className="p-6">
             <Clock className="w-12 h-12 text-green-400 mx-auto mb-4" />
             <h3 className="text-3xl font-bold text-white mb-2">24/7</h3>
             <p className="text-gray-300">Онлайн дэмжлэг</p>
           </div>
         </div>
       </div>
     </div>

     {/* Contact Section */}
     <div className="py-20">
       <div className="max-w-6xl mx-auto px-6">
         <div className="text-center mb-16">
           <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
             Холбоо барих
           </h2>
           <p className="text-xl text-gray-300">
             Бидэнтэй холбогдохын тулд дараах арганы аль нэгийг сонгоорой
           </p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
           {/* Chat Card */}
           <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-8 text-center hover:transform hover:scale-105 transition-all duration-300">
             <MessageCircle className="w-16 h-16 text-blue-400 mx-auto mb-6" />
             <h3 className="text-2xl font-bold text-white mb-4">Чат</h3>
             <p className="text-gray-300 mb-6">
               Шууд чатаар холбогдоорой
             </p>
             <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
               Чат эхлүүлэх
             </button>
           </div>

           {/* Message Card */}
           <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8 text-center hover:transform hover:scale-105 transition-all duration-300">
             <Mail className="w-16 h-16 text-purple-400 mx-auto mb-6" />
             <h3 className="text-2xl font-bold text-white mb-4">Мессеж</h3>
             <p className="text-gray-300 mb-2">08:00 - 20:15</p>
             <p className="text-gray-300 mb-6">90-46</p>
             <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
               Мессеж илгээх
             </button>
           </div>

           {/* Phone Card */}
           <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-sm border border-green-500/20 rounded-2xl p-8 text-center hover:transform hover:scale-105 transition-all duration-300">
             <Phone className="w-16 h-16 text-green-400 mx-auto mb-6" />
             <h3 className="text-2xl font-bold text-white mb-4">Утас</h3>
             <p className="text-gray-300 mb-2">08:00 - 16:50</p>
             <p className="text-gray-300 mb-6">50-44</p>
             <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
               Залгах
             </button>
           </div>
         </div>

         {/* Working Hours */}
         <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/10">
           <Clock className="w-12 h-12 text-yellow-400 mx-auto mb-6" />
           <h3 className="text-2xl font-bold text-white mb-6">Ажиллах цаг</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
             <div className="bg-white/5 rounded-lg p-4">
               <p className="text-lg font-semibold text-white mb-2">Даваа - Пүрэв</p>
               <p className="text-gray-300">08:00 - 16:50</p>
             </div>
             <div className="bg-white/5 rounded-lg p-4">
               <p className="text-lg font-semibold text-white mb-2">Баасан</p>
               <p className="text-gray-300">08:00 - 15:00</p>
             </div>
           </div>
           <p className="text-gray-400 text-sm mt-6">
             2024 оны 4 сарын 26-ны өдрөөс эхлэн
           </p>
         </div>
       </div>
     </div>

     {/* Footer CTA */}
     <div className="py-16 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
       <div className="max-w-4xl mx-auto text-center px-6">
         <h3 className="text-3xl font-bold text-white mb-4">
           Та бидэнтэй нэгдэхэд бэлэн үү?
         </h3>
         <p className="text-xl text-gray-300 mb-8">
           Өнөөдөр л эхлүүлээрэй эсвэл дэлгэрэнгүй мэдээлэл авахын тулд холбогдоорой
         </p>
         <div className="flex flex-col sm:flex-row gap-4 justify-center">
           <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-medium text-lg transition-colors">
             Дэлгүүр үзэх
           </button>
           <button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-lg font-medium text-lg transition-colors">
             Холбогдох
           </button>
         </div>
       </div>
     </div>
   </div>
 )
}