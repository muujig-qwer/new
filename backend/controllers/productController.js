import Category from '../models/Category.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose'

export const getProductsByCategoryId = async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Subcategory-уудыг авах
    const subCategories = await Category.find({ parent: categoryId }).select('_id');
    const subCategoryIds = subCategories.map((cat) => cat._id.toString());
    const allCategoryIds = [categoryId, ...subCategoryIds];

    // Аль ч хэлбэрээр хадгалагдсан category-г хамруулах
    const products = await Product.find({
      category: { $in: allCategoryIds.map(id => new mongoose.Types.ObjectId(id)) }
    });

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Алдаа гарлаа', error: err.message });
  }
}




export const createProduct = async (req, res) => {
  try {
    const { name, price, description, category, stock, discount, discountExpires } = req.body;
    let images = [];

    // Файлаар upload хийсэн зургууд
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => file.filename);
    }

    // URL-аар ирсэн зургууд
    if (req.body.imageUrls) {
      // imageUrls нэг ширхэг string эсвэл массив байж болно
      if (Array.isArray(req.body.imageUrls)) {
        images = images.concat(req.body.imageUrls);
      } else if (typeof req.body.imageUrls === 'string') {
        images.push(req.body.imageUrls);
      }
    }

    let sizes = [];
    if (req.body.sizes) {
      if (Array.isArray(req.body.sizes)) sizes = req.body.sizes;
      else sizes = [req.body.sizes];
    }

    // stock нь string хэлбэрээр ирвэл parse хийнэ
    let parsedStock = [];
    if (stock) {
      if (typeof stock === "string") {
        parsedStock = JSON.parse(stock);
      } else {
        parsedStock = stock;
      }
    }

    const discountValue = Number(discount) || 0;
    const priceValue = Number(price) || 0;
    const discountPrice = discountValue > 0 ? Math.round(priceValue * (1 - discountValue / 100)) : priceValue;

    const product = await Product.create({
      name,
      price: priceValue,
      description,
      category,
      stock: parsedStock, // энд зөв дамжуулна
      images,
      sizes,
      discount: discountValue,
      discountPrice,
      discountExpires,
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('category', 'name')
    res.json(products)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');
    if (!product) return res.status(404).json({ message: 'Not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { name, price, description, category, discount, discountPrice, discountExpires, stock } = req.body;

    // stock нь string хэлбэрээр ирвэл parse хийнэ
    let parsedStock = [];
    if (stock) {
      if (typeof stock === "string") {
        parsedStock = JSON.parse(stock);
      } else {
        parsedStock = stock;
      }
    }

    // ...sizes, images гэх мэт бусад талбарууд...

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        price,
        description,
        category,
        stock: parsedStock, // зөв дамжуулна
        // бусад талбарууд...
        discount,
        discountPrice,
        discountExpires,
      },
      { new: true }
    );
    res.status(200).json(product);
  } catch (err) {
    console.error('Product update error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Сэтгэгдэл авах
export const getProductComments = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id, 'comments');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product.comments || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Сэтгэгдэл нэмэх
export const addProductComment = async (req, res) => {
  try {
    const { author, comment, rating, date } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const newComment = { author, comment, rating, date: date || new Date() };
    product.comments.push(newComment);
    await product.save();

    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

