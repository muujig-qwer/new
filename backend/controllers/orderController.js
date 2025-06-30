import Order from '../models/Order.js'
import User from '../models/User.js'
import Product from '../models/Product.js'

export const createOrder = async (req, res) => {
  try {
    const { email, products, totalPrice } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Email байхгүй байна' })
    }

    // Email-ээр хэрэглэгчийг хайна, байхгүй бол шинээр үүсгэнэ
    let user = await User.findOne({ email })
    if (!user) {
      user = await User.create({ email, name: email.split('@')[0] }) // эсвэл илүү дэлгэрэнгүй мэдээлэл session-оос илгээнэ
    }

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Бүтээгдэхүүн байхгүй байна' })
    }

    const order = new Order({
      user: user._id,
      products,
      totalPrice,
    })

    await order.save()

    // Захиалсан бүтээгдэхүүн бүрийн үлдэгдлийг хасах
    for (const item of products) {
      const { product: productId, size, color, quantity } = item;
      const product = await Product.findById(productId);
      if (!product) continue; // эсвэл алдаа буцааж болно

      // stock дотор тохирох size, color байгаа эсэхийг шалгана
      const stockIndex = product.stock.findIndex(
        (s) => s.size === size && s.color === color
      );
      if (stockIndex === -1) {
        // тохирох stock байхгүй бол алдаа буцаах эсвэл continue
        // return res.status(400).json({ message: `Барааны үлдэгдэл олдсонгүй: ${product.name} (${size}, ${color})` });
        continue;
      }

      // update хийх
      product.stock[stockIndex].quantity -= quantity;
      await product.save();
    }

    res.status(201).json(order)
  } catch (err) {
    console.error('Order үүсгэхэд алдаа:', err)
    res.status(500).json({ message: 'Захиалга үүсгэхэд алдаа гарлаа' })
  }
};

export const getOrders = async (req, res) => {
  try {
    const { email } = req.query;
    let user = null;
    if (email) {
      user = await User.findOne({ email });
    }
    let filter = {};
    if (user) {
      filter.user = user._id;
    }
    const orders = await Order.find(filter).populate('products.product');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Захиалга уншихад алдаа гарлаа' });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email')
    res.json(orders)
  } catch (err) {
    res.status(500).json({ message: 'Серверийн алдаа' })
  }
}
