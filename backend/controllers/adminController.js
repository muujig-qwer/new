import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

function getMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { start, end };
}

export const getMonthlyStats = async (req, res) => {
  try {
    const { start, end } = getMonthRange();
    const completedOrders = await Order.find({
      status: "completed",
      createdAt: { $gte: start, $lt: end },
    });

    let soldProducts = 0;
    let totalRevenue = 0;
    completedOrders.forEach(order => {
      // Барааны тоо
      if (order.cartItems && Array.isArray(order.cartItems)) {
        soldProducts += order.cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
      }
      // Орлого
      totalRevenue += order.totalPrice || 0;
    });

    const newProducts = await Product.countDocuments({
      createdAt: { $gte: start, $lt: end },
    });

    const newUsers = await User.countDocuments({
      createdAt: { $gte: start, $lt: end },
    });

    res.json({
      soldProducts,
      newProducts,
      newUsers,
      totalRevenue,
    });
  } catch (err) {
    res.status(500).json({ error: "Статистик авахад алдаа гарлаа." });
  }
};

export const assignOrderToDelivery = async (req, res) => {
  const { orderId } = req.params;
  const { delivery } = req.body; // delivery user _id
  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Зөвхөн pending эсвэл өөр статуснаас assigned болж байгаа үед л stock-оос хасна
    if (order.status !== "assigned") {
      // Захиалгын бараа бүрийн үлдэгдлийг хасна
      for (const item of order.cartItems) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { "stock.0.quantity": -item.quantity } } // stock массивын эхний элементийн quantity-гаас хасна
        );
      }
    }

    order.delivery = delivery;
    order.status = "assigned";
    await order.save();

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("user");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};