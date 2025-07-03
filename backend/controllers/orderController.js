import Order from '../models/Order.js'
import User from '../models/User.js'
import Product from '../models/Product.js'
import Notification from '../models/Notification.js' // Notification model-оо импортлоорой

export const createOrder = async (req, res) => {
  try {
    const {
      cartItems,
      phone,
      note,
      location,
      totalPrice,
      payWithWallet,
      payWithQr,
      coupon,
    } = req.body;

    // Хэрэглэгчийг req.user эсвэл session-оос авна
    const user = await User.findById(req.user?._id);

    if (!user) {
      return res.status(400).json({ message: 'Хэрэглэгч олдсонгүй' });
    }

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ message: 'Бүтээгдэхүүн байхгүй байна' });
    }

    // Wallet-ээр төлөх бол үлдэгдэл шалгах
    if (payWithWallet) {
      if (user.wallet < totalPrice) {
        return res.status(400).json({ message: "Хэтэвчний үлдэгдэл хүрэлцэхгүй байна" });
      }
      user.wallet -= totalPrice;
      await user.save();
    }

    // Order үүсгэх
    const order = new Order({
      user: user._id,
      cartItems: cartItems,
      phone,
      note,
      location,
      totalPrice,
      payWithWallet: !!payWithWallet,
      payWithQr: !!payWithQr,
      coupon, // { code, discount, discountAmount }
      status: "pending",
    });

    await order.save();

    // Захиалга үүсэхэд notification үүсгэнэ
    await Notification.create({
      userId: user._id,
      title: "Захиалга амжилттай!",
      body: "Таны захиалга амжилттай бүртгэгдлээ.",
      date: new Date(),
      read: false,
    });

    // Захиалсан бүтээгдэхүүн бүрийн үлдэгдлийг хасах
    for (const item of cartItems) {
      const { product: productId, size, color, quantity } = item;
      const product = await Product.findById(productId);
      if (!product) continue;
      const stockIndex = product.stock.findIndex(
        (s) => s.size === size && s.color === color
      );
      if (stockIndex === -1) {
        continue;
      }
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
    // products.product биш, cartItems.product гэж populate хийнэ!
    const orders = await Order.find(filter).populate('user', 'name email').populate('cartItems.product');
    res.json(orders);
  } catch (err) {
    console.error('orders error:', err);
    res.status(500).json({ message: 'Захиалга уншихад алдаа гарлаа' });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });

    // Статус хүргэлтэд эсвэл дууссан үед notification үүсгэнэ
    if (order) {
      if (req.body.status === "shipped") {
        await Notification.create({
          userId: order.user,
          title: "Захиалга хүргэлтэд гарлаа",
          body: "Таны захиалга хүргэлтэд гарсан байна.",
          date: new Date(),
          read: false,
        });
      }
      if (req.body.status === "completed") {
        await Notification.create({
          userId: order.user,
          title: "Захиалга дууслаа",
          body: "Таны захиалга амжилттай хүргэгдлээ.",
          date: new Date(),
          read: false,
        });
      }
    }

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
    const orders = await Order.find().populate('user', 'name email').populate('cartItems.product');
    res.json(orders)
  } catch (err) {
    res.status(500).json({ message: 'Серверийн алдаа' })
  }
}
