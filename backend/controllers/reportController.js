import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Coupon from "../models/Coupon.js";
import Category from "../models/Category.js";
import { Parser } from "json2csv";

// 1. Захиалгын тайлан
export const orderReport = async (req, res) => {
  try {
    const groupBy = req.query.groupBy || "day";
    let dateFormat = "%Y-%m-%d";
    if (groupBy === "month") dateFormat = "%Y-%m";
    if (groupBy === "year") dateFormat = "%Y";

    // ↓↓↓ Өдрийн filter нэмэх ↓↓↓
    const match = {};
    if (req.query.date && groupBy === "day") {
      const start = new Date(req.query.date);
      const end = new Date(req.query.date);
      end.setDate(end.getDate() + 1);
      match.createdAt = { $gte: start, $lt: end };
    }

    const stats = await Order.aggregate([
      { $match: match },
      {
        $addFields: {
          createdAtDate: {
            $cond: [
              { $isNumber: "$createdAt" },
              { $toDate: "$createdAt" },
              "$createdAt"
            ]
          }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: "$createdAtDate" } },
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$totalPrice" },
          avgOrderValue: { $avg: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    console.log("Order stats:", stats); // ← ЭНД нэмнэ

    // Төлбөрийн төрөл (wallet / qr / cash)
    const paymentTypes = await Order.aggregate([
      {
        $group: {
          _id: {
            wallet: "$payWithWallet",
            qr: "$payWithQr",
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const paymentSummary = {
      wallet: paymentTypes.filter((t) => t._id.wallet).reduce((a, b) => a + b.count, 0),
      qr: paymentTypes.filter((t) => t._id.qr).reduce((a, b) => a + b.count, 0),
      cash: paymentTypes.filter((t) => !t._id.wallet && !t._id.qr).reduce((a, b) => a + b.count, 0),
    };

    // Хүргэлтийн төлөв
    const deliveryStatus = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const deliverySummary = {};
    deliveryStatus.forEach((item) => {
      deliverySummary[item._id] = item.count;
    });

    // 🎯 Шинэ: Өгөгдлийг графикт ашиглах боломжтой формат руу хөрвүүлэв
    const chartData = stats.map((s) => ({
      date: s._id,
      totalOrders: s.totalOrders,
      totalRevenue: s.totalRevenue,
      avgOrderValue: Math.round(s.avgOrderValue || 0),
    }));

    res.json({
      stats: chartData,
      paymentSummary,
      deliverySummary,
    });
  } catch (e) {
    res.status(500).json({ message: "Алдаа: " + e.message });
  }
};


// 2. Барааны борлуулалтын тайлан
export const productReport = async (req, res) => {
  try {
    const search = req.query.search || "";
    // Product нэрээр хайлт хийх
    const productFilter = search
      ? { name: { $regex: search, $options: "i" } }
      : {};

    // Бүтээгдэхүүний жагсаалт
    const products = await Product.find(productFilter).lean();

    // Тухайн хайсан бүтээгдэхүүний дэлгэрэнгүй, захиалга, мэдэгдэл гэх мэт
    let productDetails = null;
    if (search && products.length === 1) {
      const product = products[0];
      // Захиалгууд
      const orders = await Order.find({ "cartItems.product": product._id }).lean();
      // Мэдэгдэл (жишээ)
      // const notifications = await Notification.find({ product: product._id }).lean();
      productDetails = {
        ...product,
        orders,
        // notifications,
      };
    }

    res.json({
      products,
      productDetails,
      // ... бусад тайлангийн өгөгдөл ...
    });
  } catch (e) {
    res.status(500).json({ message: "Алдаа: " + e.message });
  }
};

// 3. Хэрэглэгчийн тайлан
export const userReport = async (req, res) => {
  try {
    const search = req.query.search || "";
    const userFilter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const groupBy = req.query.groupBy || "day";
    let dateFormat = "%Y-%m-%d";
    if (groupBy === "month") dateFormat = "%Y-%m";
    if (groupBy === "year") dateFormat = "%Y";

    const newUsers = await User.aggregate([
      { $match: userFilter },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const activeUsers = await Order.distinct("user");
    const totalUsers = await User.countDocuments(userFilter);
    const userTypes = await User.aggregate([
      { $match: userFilter },
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    // Хайлтын үр дүнг буцаах
    const users = await User.find(userFilter).lean();

    res.json({
      newUsers,
      activeUsers: activeUsers.length,
      totalUsers,
      userTypes,
      users, // хайлтын үр дүн
    });
  } catch (e) {
    res.status(500).json({ message: "Алдаа: " + e.message });
  }
};

// 4. Купон ашиглалтын тайлан
export const couponReport = async (req, res) => {
  try {
    const search = req.query.search || "";
    const couponFilter = search
      ? { code: { $regex: search, $options: "i" } }
      : {};

    const usedCoupons = await Order.aggregate([
      { $match: { "coupon.code": { $exists: true, $ne: null, ...couponFilter } } },
      { $group: { _id: "$coupon.code", used: { $sum: 1 }, totalSaved: { $sum: "$coupon.discountAmount" } } },
      { $sort: { used: -1 } },
    ]);
    const totalUsed = usedCoupons.length;
    const topCoupons = usedCoupons.slice(0, 5);
    const totalSaved = usedCoupons.reduce((a, b) => a + (b.totalSaved || 0), 0);

    res.json({
      totalUsed,
      topCoupons,
      totalSaved,
    });
  } catch (e) {
    res.status(500).json({ message: "Алдаа: " + e.message });
  }
};

// 5. Орлогын график / статистик
export const revenueReport = async (req, res) => {
  try {
    const search = req.query.search || "";
    // search-ийг date filter гэж үзэж болно (жишээ нь: 2025-07)
    const dateMatch = search
      ? { $match: { createdAt: { $regex: search, $options: "i" } } }
      : {};

    const daily = await Order.aggregate([
      ...(search ? [dateMatch] : []),
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const monthly = await Order.aggregate([
      ...(search ? [dateMatch] : []),
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          revenue: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const topDays = daily.slice(-5).reverse();

    res.json({
      daily,
      monthly,
      topDays,
    });
  } catch (e) {
    res.status(500).json({ message: "Алдаа: " + e.message });
  }
};

// 6. Хүргэлтийн тайлан
export const deliveryReport = async (req, res) => {
  try {
    const search = req.query.search || "";
    const statusFilter = search
      ? { status: { $regex: search, $options: "i" } }
      : {};

    const status = await Order.aggregate([
      { $match: statusFilter },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const companies = await Order.aggregate([
      { $match: { delivery: { $exists: true, $ne: null, ...(search ? { $regex: search, $options: "i" } : {}) } } },
      {
        $group: {
          _id: "$delivery",
          delivered: { $sum: 1 },
        },
      },
    ]);
    res.json({
      status,
      companies,
    });
  } catch (e) {
    res.status(500).json({ message: "Алдаа: " + e.message });
  }
};

// Захиалгын тайланг CSV болгон хөрвүүлэх
export const orderReportCsv = async (req, res) => {
  try {
    const orders = await Order.find().lean();
    const fields = ["_id", "user", "totalPrice", "status", "createdAt"];
    const parser = new Parser({ fields });
    const csv = parser.parse(orders);

    res.header("Content-Type", "text/csv");
    res.attachment("orders.csv");
    res.send(csv);
  } catch (e) {
    res.status(500).json({ message: "Алдаа: " + e.message });
  }
};


// Нөөц багатай бүтээгдэхүүний тайлан
export const lowStockReport = async (req, res) => {
  try {
    const threshold = Number(req.query.threshold) || 5; // default 5-аас доош
    const products = await Product.find({ stock: { $lte: threshold } }).lean();
    res.json({
      count: products.length,
      products,
    });
  } catch (e) {
    res.status(500).json({ message: "Алдаа: " + e.message });
  }
};



export const reportList = (req, res) => {
  res.json([
    { _id: "orders", title: "Захиалгын тайлан", date: "2025-07-04", status: "Бэлэн" },
    { _id: "products", title: "Барааны борлуулалтын тайлан", date: "2025-07-04", status: "Бэлэн" },
    { _id: "users", title: "Хэрэглэгчийн тайлан", date: "2025-07-04", status: "Бэлэн" },
    { _id: "coupons", title: "Купон ашиглалтын тайлан", date: "2025-07-04", status: "Бэлэн" },
    { _id: "revenue", title: "Орлогын график / статистик", date: "2025-07-04", status: "Бэлэн" },
    { _id: "delivery", title: "Хүргэлтийн тайлан", date: "2025-07-04", status: "Бэлэн" },
    { _id: "lowstock", title: "Нөөц багатай бүтээгдэхүүн", date: "2025-07-04", status: "Бэлэн" },
  ]);
};