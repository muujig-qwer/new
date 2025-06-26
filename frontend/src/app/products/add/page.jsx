'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { jwtDecode } from 'jwt-decode'

const defaultSizes = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45']
// 10 default өнгө массив
const defaultColors = [
  { name: "Хар", value: "#000000" },
  { name: "Цагаан", value: "#FFFFFF" },
  { name: "Улаан", value: "#FF0000" },
  { name: "Хөх", value: "#0074D9" },
  { name: "Шар", value: "#FFDC00" },
  { name: "Ногоон", value: "#2ECC40" },
  { name: "Бор", value: "#8B4513" },
  { name: "Саарал", value: "#AAAAAA" },
  { name: "Ягаан", value: "#FF69B4" },
  { name: "Хүрэн", value: "#800000" },
];

export default function AddProductPage() {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState([]) // Файл зургууд
  const [imageUrls, setImageUrls] = useState(['']) // URL зургууд
  const [categories, setCategories] = useState([])
  const [category, setCategory] = useState('')
  const [sizes, setSizes] = useState([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [discount, setDiscount] = useState('') // 1. discount state нэмэх
  const [discountExpires, setDiscountExpires] = useState(""); // state нэмэх
  const [stock, setStock] = useState(
    defaultSizes.map(size => ({ size, quantity: 0 }))
  );
  const [colorStocks, setColorStocks] = useState([{ color: "", quantity: 0 }]);
  const [stockType, setStockType] = useState("size"); // "size" эсвэл "color"
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    try {
      const decoded = jwtDecode(token)
      if (decoded.role === 'admin') {
        setIsAdmin(true)
      } else {
        router.push('/')
      }
    } catch {
      router.push('/login')
    }
  }, [router])

  useEffect(() => {
    axios.get('http://localhost:5000/api/categories').then((res) => {
      setCategories(res.data)
    })
  }, [])

  // Олон зураг сонгох
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    setImages(files)
  }

  // URL input өөрчлөх
  const handleImageUrlChange = (idx, value) => {
    const newUrls = [...imageUrls]
    newUrls[idx] = value
    setImageUrls(newUrls)
  }

  // URL input нэмэх
  const addImageUrlInput = () => {
    setImageUrls([...imageUrls, ''])
  }

  // Хэмжээ бүрийн үлдэгдэл өөрчлөх
  const handleStockChange = (size, value) => {
    setStock(prev =>
      prev.map(s =>
        s.size === size ? { ...s, quantity: Number(value) } : s
      )
    );
  };

  // Өнгөний үлдэгдэл өөрчлөх (field === "color" үед зөвхөн value-г хадгална)
  const handleColorStockChange = (idx, field, value) => {
    setColorStocks(prev =>
      prev.map((item, i) =>
        i === idx ? { ...item, [field]: field === "quantity" ? Number(value) : value } : item
      )
    );
  };

  // Өнгөний мөр нэмэх
  const addColorStockRow = () => {
    setColorStocks([...colorStocks, { color: "", quantity: 0 }]);
  };

  // Өнгөний мөр устгах
  const removeColorStockRow = (idx) => {
    setColorStocks(colorStocks.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Нэвтэрч орно уу');
      router.push('/login');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('price', price);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('discount', discount);
      if (discountExpires) {
        formData.append('discountExpires', new Date(discountExpires).toISOString());
      }
      images.forEach((img) => formData.append('images', img));
      imageUrls
        .filter((url) => url.trim() !== '')
        .forEach((url) => formData.append('imageUrls', url));
      sizes.forEach((size) => formData.append('sizes', size));
      // stock төрөлд тааруулж дамжуулах
      if (stockType === "size") {
        formData.append('stock', JSON.stringify(stock.filter(s => s.quantity > 0)));
      } else {
        formData.append('stock', JSON.stringify(colorStocks.filter(s => s.color && s.quantity > 0)));
      }

      await axios.post(
        'http://localhost:5000/api/products',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      alert('Бүтээгдэхүүн нэмэгдлээ!');
      router.push('/products');
    } catch (err) {
      alert('Алдаа гарлаа: ' + (err.response?.data?.message || 'Unknown error'));
    }
  }

  if (!isAdmin) {
    return <p className="mt-10 text-center">Ачааллаж байна...</p>
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 border rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Бүтээгдэхүүн нэмэх</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Нэр"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="number"
          placeholder="Үнэ"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        {/* 3. Discount input талбар нэмэх */}
        <input
          type="number"
          placeholder="Хөнгөлөлт (%)"
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
          className="w-full border p-2 rounded"
          min={0}
          max={100}
        />
        {/* Хямдралын дуусах хугацаа input */}
        <input
          type="datetime-local"
          placeholder="Хямдрал дуусах хугацаа"
          value={discountExpires}
          onChange={(e) => setDiscountExpires(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <textarea
          placeholder="Тайлбар"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border p-2 rounded"
          rows={4}
        />
        <div>
          <label className="block mb-1 font-medium">Зураг upload хийх</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Зурагны URL-ууд</label>
          {imageUrls.map((url, idx) => (
            <div key={idx} className="flex space-x-2 mb-2">
              <input
                type="text"
                placeholder="Зурагны URL"
                value={url}
                onChange={(e) => handleImageUrlChange(idx, e.target.value)}
                className="w-full border p-2 rounded"
              />
              {idx === imageUrls.length - 1 && (
                <button
                  type="button"
                  onClick={addImageUrlInput}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  +
                </button>
              )}
            </div>
          ))}
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border p-2 rounded"
          required
        >
          <option value="">Ангилал сонгох</option>
          {/* Эхлээд parent category-уудыг харуулна */}
          {categories
            .filter((cat) => !cat.parent)
            .map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          {/* Дараа нь subcategory-уудыг parent-тай нь хамт харуулна */}
          {categories
            .filter((cat) => cat.parent)
            .map((cat) => {
              const parent = categories.find((c) => c._id === cat.parent);
              const label = parent ? `${parent.name} > ${cat.name}` : cat.name;
              return (
                <option key={cat._id} value={cat._id}>
                  {label}
                </option>
              );
            })}
        </select>
        {/* Үлдэгдлийн төрөл сонгох */}
        <div>
          <label className="block font-medium mb-2">Үлдэгдлийн төрөл</label>
          <select
            value={stockType}
            onChange={e => setStockType(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="size">Хэмжээгээр</option>
            <option value="color">Өнгөөр</option>
          </select>
        </div>
        {/* Хэмжээ ба үлдэгдэл */}
        {stockType === "size" && (
          <div>
            <label className="block font-medium mb-2">Хэмжээ ба үлдэгдэл</label>
            <div className="grid grid-cols-2 gap-2">
              {defaultSizes.map(size => (
                <div key={size} className="flex items-center space-x-2">
                  <span className="w-8">{size}</span>
                  <input
                    type="number"
                    min={0}
                    value={stock.find(s => s.size === size)?.quantity || 0}
                    onChange={e => handleStockChange(size, e.target.value)}
                    className="border p-2 rounded w-24"
                    placeholder="Үлдэгдэл"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Өнгө ба үлдэгдэл */}
        {stockType === "color" && (
          <div>
            <label className="block font-medium mb-2">Өнгө ба үлдэгдэл</label>
            <div className="space-y-2">
              {colorStocks.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  {/* Өнгө сонгох select */}
                  <select
                    value={item.color}
                    onChange={e => handleColorStockChange(idx, "color", e.target.value)}
                    className="border p-2 rounded w-36"
                    required
                  >
                    <option value="">Өнгө сонгох</option>
                    {defaultColors.map((color) => (
                      <option key={color.value} value={color.value}>
                        {color.name}
                      </option>
                    ))}
                  </select>
                  {/* Өнгөний preview */}
                  {item.color && (
                    <span
                      className="inline-block w-6 h-6 rounded-full border"
                      style={{ backgroundColor: item.color }}
                    ></span>
                  )}
                  <input
                    type="number"
                    min={0}
                    placeholder="Үлдэгдэл"
                    value={item.quantity}
                    onChange={e => handleColorStockChange(idx, "quantity", e.target.value)}
                    className="border p-2 rounded w-20"
                    required
                  />
                  {colorStocks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeColorStockRow(idx)}
                      className="px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                    >
                      x
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addColorStockRow}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 mt-1"
              >
                + Өнгө нэмэх
              </button>
            </div>
          </div>
        )}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Нэмэх
        </button>
      </form>
    </div>
  )
}
