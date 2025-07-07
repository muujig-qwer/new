import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Coupon from "../models/Coupon.js";
import Category from "../models/Category.js";
import { Parser } from "json2csv";
import puppeteer from "puppeteer";

// 1. Захиалгын тайлан
export const orderReport = async (req, res) => {
  try {
    const groupBy = req.query.groupBy || "day";
    let dateFormat = "%Y-%m-%d";
    if (groupBy === "month") dateFormat = "%Y-%m";
    if (groupBy === "year") dateFormat = "%Y";

    // from/to filter
    const match = {};
    if (req.query.from) {
      match.createdAt = { ...match.createdAt, $gte: new Date(req.query.from) };
    }
    if (req.query.to) {
      // to-г дуусах өдрийн 23:59:59 болгоно
      const toDate = new Date(req.query.to);
      toDate.setHours(23, 59, 59, 999);
      match.createdAt = { ...match.createdAt, $lte: toDate };
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
      { $match: { delivery: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: "$delivery",
          delivered: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          delivered: 1,
          name: "$user.name"
        }
      }
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
    // stock массивын аль нэг quantity бага бол
    const products = await Product.find({
      stock: { $elemMatch: { quantity: { $lte: threshold } } }
    }).lean();
    res.json({
      count: products.length,
      products,
    });
  } catch (e) {
    res.status(500).json({ message: "Алдаа: " + e.message });
  }
};



export const reportList = async (req, res) => {
  try {
    const [lastOrder, lastProduct, lastUser, lastUsedCouponOrder] = await Promise.all([
      Order.findOne().sort({ createdAt: -1 }).lean(),
      Product.findOne().sort({ createdAt: -1 }).lean(),
      User.findOne().sort({ createdAt: -1 }).lean(),
      Order.findOne({ "coupon.code": { $exists: true, $ne: null } }).sort({ createdAt: -1 }).lean(),
    ]);

    const formatDate = (date) => date ? new Date(date).toISOString().split('T')[0] : 'N/A';

    res.json([
      { _id: "orders", title: "Захиалгын тайлан", date: formatDate(lastOrder?.createdAt), status: "Бэлэн" },
      { _id: "products", title: "Барааны борлуулалтын тайлан", date: formatDate(lastProduct?.createdAt), status: "Бэлэн" },
      { _id: "users", title: "Хэрэглэгчийн тайлан", date: formatDate(lastUser?.createdAt), status: "Бэлэн" },
      { _id: "user-segmentation", title: "Хэрэглэгчийн сегментчилэл", date: formatDate(lastUser?.createdAt), status: "Бэлэн" }, // Шинэ тайлан
      { _id: "sales-by-time", title: "Цагийн бүсчлэлийн тайлан", date: formatDate(lastOrder?.createdAt), status: "Бэлэн" }, // Шинэ тайлан
      { _id: "market-basket", title: "Хамтдаа зарагддаг бараа", date: formatDate(lastOrder?.createdAt), status: "Бэлэн" }, // Шинэ тайлан
      { _id: "coupons", title: "Купон ашиглалтын тайлан", date: formatDate(lastUsedCouponOrder?.createdAt), status: "Бэлэн" },
      { _id: "revenue", title: "Орлогын график / статистик", date: formatDate(lastOrder?.createdAt), status: "Бэлэн" },
      { _id: "delivery", title: "Хүргэлтийн тайлан", date: formatDate(lastOrder?.createdAt), status: "Бэлэн" },
      { _id: "lowstock", title: "Нөөц багатай бүтээгдэхүүн", date: formatDate(lastProduct?.updatedAt), status: "Бэлэн" },
    ]);
  } catch (e) {
    console.error("Failed to generate dynamic report list", e);
    // Fallback to static list on error
    res.json([
      { _id: "orders", title: "Захиалгын тайлан", date: "error", status: "Алдаатай" },
      { _id: "products", title: "Барааны борлуулалтын тайлан", date: "error", status: "Алдаатай" },
      { _id: "users", title: "Хэрэглэгчийн тайлан", date: "error", status: "Алдаатай" },
      { _id: "coupons", title: "Купон ашиглалтын тайлан", date: "error", status: "Алдаатай" },
      { _id: "revenue", title: "Орлогын график / статистик", date: "error", status: "Алдаатай" },
      { _id: "delivery", title: "Хүргэлтийн тайлан", date: "error", status: "Алдаатай" },
      { _id: "lowstock", title: "Нөөц багатай бүтээгдэхүүн", date: "error", status: "Алдаатай" },
    ]);
  }
};

export const downloadReportPdf = async (req, res) => {
  const reportId = req.params.id;
  let data = {};
  let tableHtml = ""; // ← энэ мөрийг нэм

  if (reportId === "orders") {
    const stats = await Order.aggregate([
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
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAtDate" } },
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    data.stats = stats;
    tableHtml = `
      <table>
        <thead>
          <tr>
            <th>Огноо</th>
            <th>Захиалга</th>
            <th>Орлого</th>
          </tr>
        </thead>
        <tbody>
          ${data.stats?.map(row => `
            <tr>
              <td>${row._id}</td>
              <td>${row.totalOrders}</td>
              <td>${row.totalRevenue?.toLocaleString()}₮</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  } else if (reportId === "products") {
    const products = await Product.find().lean();
    data.products = products;
    tableHtml = `
      <table>
        <thead>
          <tr>
            <th>Бүтээгдэхүүн</th>
            <th>Үлдэгдэл</th>
          </tr>
        </thead>
        <tbody>
          ${data.products?.map(p => `
            <tr>
              <td>${p.name}</td>
              <td>
                ${Array.isArray(p.stock) && p.stock.length > 0
                  ? p.stock.map(s => `${s.color}: ${s.quantity}`).join(", ")
                  : "-"}
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  } else if (reportId === "users") {
    const users = await User.find().lean();
    data.users = users;
    tableHtml = `
      <table>
        <thead>
          <tr>
            <th>Нэр</th>
            <th>И-мэйл</th>
            <th>Төрөл</th>
          </tr>
        </thead>
        <tbody>
          ${data.users?.map(u => `
            <tr>
              <td>${u.name}</td>
              <td>${u.email}</td>
              <td>${u.role}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  } else if (reportId === "coupons") {
    // Купон ашиглалтын тайлан
    const usedCoupons = await Order.aggregate([
      { $match: { "coupon.code": { $exists: true, $ne: null } } },
      { $group: { _id: "$coupon.code", used: { $sum: 1 }, totalSaved: { $sum: "$coupon.discountAmount" } } },
      { $sort: { used: -1 } },
    ]);
    data.coupons = usedCoupons;
    tableHtml = `
      <table>
        <thead>
          <tr>
            <th>Купон код</th>
            <th>Ашигласан тоо</th>
            <th>Нийт хэмнэлт</th>
          </tr>
        </thead>
        <tbody>
          ${data.coupons?.map(c => `
            <tr>
              <td>${c._id}</td>
              <td>${c.used}</td>
              <td>${c.totalSaved?.toLocaleString()}₮</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  } else if (reportId === "revenue") {
    // Орлогын график / статистик
    const daily = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    data.daily = daily;
    tableHtml = `
      <table>
        <thead>
          <tr>
            <th>Огноо</th>
            <th>Орлого</th>
          </tr>
        </thead>
        <tbody>
          ${data.daily?.map(r => `
            <tr>
              <td>${r._id}</td>
              <td>${r.revenue?.toLocaleString()}₮</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  } else if (reportId === "delivery") {
    // Хүргэлтийн тайлан
    const status = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const companies = await Order.aggregate([
      { $match: { delivery: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: "$delivery",
          delivered: { $sum: 1 },
        },
      },
    ]);
    data.status = status;
    data.companies = companies;
    tableHtml = `
      <div>
        <div style="font-weight:bold;margin-bottom:8px;">Хүргэлтийн төлөв:</div>
        <table>
          <thead>
            <tr>
              <th>Төлөв</th>
              <th>Тоо</th>
            </tr>
          </thead>
          <tbody>
            ${data.status?.map(s => `
              <tr>
                <td>${s._id}</td>
                <td>${s.count}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        <div style="font-weight:bold;margin:16px 0 8px;">Хүргэлтийн компаниуд:</div>
        <table>
          <thead>
            <tr>
              <th>Компани/Ажилтан ID</th>
              <th>Хүргэлтийн тоо</th>
            </tr>
          </thead>
          <tbody>
            ${data.companies?.map(c => `
              <tr>
                <td>${c._id}</td>
                <td>${c.delivered}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  } else if (reportId === "lowstock") {
    // Нөөц багатай бүтээгдэхүүн
    const threshold = 5;
    const products = await Product.find({
      stock: { $elemMatch: { quantity: { $lte: threshold } } }
    }).lean();
    data.products = products;
    tableHtml = `
      <table>
        <thead>
          <tr>
            <th>Бүтээгдэхүүний нэр</th>
            <th>Үлдэгдэл (өнгө тус бүр)</th>
          </tr>
        </thead>
        <tbody>
          ${data.products?.map(p => `
            <tr>
              <td>${p.name}</td>
              <td>
                ${p.stock
                  .filter(s => s.quantity <= threshold)
                  .map(s => `${s.color}: ${s.quantity}`)
                  .join(", ")}
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  }

  const html = `
    <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          body { font-family: Arial; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ccc; padding: 8px; }
          th { background: #f0f0f0; }
        </style>
      </head>
      <body>
        <h2>Тайлан: ${reportId}</h2>
        ${tableHtml}
      </body>
    </html>
  `;

  // Puppeteer ашиглан PDF үүсгэх
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true,
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  const pdfBuffer = await page.pdf({ format: "A4" });
  await browser.close();

  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename=${reportId}.pdf`,
    "Content-Length": pdfBuffer.length,
  });
  res.send(pdfBuffer);
};

// Нэгдсэн самбарын мэдээлэл
export const getReportSummary = async (req, res) => {
  try {
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [todaysRevenue, pendingOrders, newUsersThisMonth, lowStockProducts] = await Promise.all([
      // Өнөөдрийн орлого
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfToday }, status: { $ne: 'Cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]),
      // Хүлээгдэж буй захиалга
      Order.countDocuments({ status: 'pending' }),
      // Энэ сарын шинэ хэрэглэгчид
      User.countDocuments({ createdAt: { $gte: startOfMonth } }),
      // Нөөц багатай бараа (5-аас доош)
      Product.countDocuments({ 'stock.quantity': { $lte: 5 } })
    ]);

    res.json({
      todaysRevenue: todaysRevenue[0]?.total || 0,
      pendingOrders: pendingOrders || 0,
      newUsersThisMonth: newUsersThisMonth || 0,
      lowStockProducts: lowStockProducts || 0,
    });

  } catch (error) {
    console.error("Error fetching report summary:", error);
    res.status(500).json({ message: "Failed to get report summary" });
  }
};

// 7. Хэрэглэгчийн сегментчилэл
export const userSegmentationReport = async (req, res) => {
  try {
    const ninetyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 90));
    const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 30));

    // Сүүлийн 90 хоногт идэвхтэй байсан хэрэглэгчид
    const activeUserIds = await Order.distinct('user', { createdAt: { $gte: ninetyDaysAgo } });
    const activeUserIdsSet = new Set(activeUserIds.map(id => id.toString()));

    // Нийт хэрэглэгчид
    const allUsers = await User.find({}, '_id').lean();
    const inactiveUsers = allUsers.filter(user => !activeUserIdsSet.has(user._id.toString()));

    const [
      // Давтан худалдан авагчид (1-ээс олон захиалгатай)
      repeatCustomers,
      // Шинэ хэрэглэгчид (сүүлийн 30 хоногт бүртгүүлсэн)
      newUsers,
      // Шилдэг 10 худалдан авагч
      topSpenders,
    ] = await Promise.all([
      Order.aggregate([
        { $group: { _id: '$user', orderCount: { $sum: 1 } } },
        { $match: { orderCount: { $gt: 1 } } },
        { $count: 'count' }
      ]),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Order.aggregate([
        { $group: { _id: '$user', totalSpent: { $sum: '$totalPrice' } } },
        { $sort: { totalSpent: -1 } },
        { $limit: 10 },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'userDetails' } },
        { $unwind: '$userDetails' },
        { $project: { name: '$userDetails.name', email: '$userDetails.email', totalSpent: 1, _id: 0 } }
      ])
    ]);

    res.json({
      newUsers: {
        count: newUsers || 0,
        description: "Сүүлийн 30 хоногт бүртгүүлсэн"
      },
      repeatCustomers: {
        count: repeatCustomers[0]?.count || 0,
        description: "1-ээс олон удаа захиалга хийсэн"
      },
      inactiveUsers: {
        count: inactiveUsers.length,
        description: "Сүүлийн 90 хоногт захиалга хийгээгүй"
      },
      topSpenders: {
        users: topSpenders,
        description: "Нийт худалдан авалтаар тэргүүлэгч 10"
      }
    });

  } catch (e) {
    res.status(500).json({ message: "Алдаа: " + e.message });
  }
};

// 8. Цагийн бүсчлэлийн тайлан
export const salesByTimeReport = async (req, res) => {
  try {
    const [byDayOfWeek, byHourOfDay] = await Promise.all([
      // Долоо хоногийн гарагаар бүлэглэх
      Order.aggregate([
        { $project: { dayOfWeek: { $dayOfWeek: "$createdAt" }, totalPrice: 1 } },
        { $group: { _id: "$dayOfWeek", totalSales: { $sum: "$totalPrice" }, totalOrders: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      // Өдрийн цагаар бүлэглэх
      Order.aggregate([
        { $project: { hourOfDay: { $hour: "$createdAt" }, totalPrice: 1 } },
        { $group: { _id: "$hourOfDay", totalSales: { $sum: "$totalPrice" }, totalOrders: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.json({ byDayOfWeek, byHourOfDay });

  } catch (e) {
    res.status(500).json({ message: "Алдаа: " + e.message });
  }
};

// 9. Хамтдаа зарагддаг барааны тайлан (Market Basket Analysis)
export const marketBasketAnalysisReport = async (req, res) => {
  try {
    // 1. Хоёроос дээш бараатай захиалгуудыг олох
    const orders = await Order.find({ "cartItems.1": { "$exists": true } })
      .select("cartItems.product")
      .lean();

    const pairCounts = new Map();

    // 2. Захиалга бүрээс хослол үүсгэж тоолох
    orders.forEach(order => {
      const products = order.cartItems.map(item => item.product.toString());
      // Сортлох нь (P1, P2) болон (P2, P1) гэсэн давхардлыг арилгана
      products.sort(); 

      for (let i = 0; i < products.length; i++) {
        for (let j = i + 1; j < products.length; j++) {
          const pairKey = `${products[i]}-${products[j]}`;
          pairCounts.set(pairKey, (pairCounts.get(pairKey) || 0) + 1);
        }
      }
    });

    // 3. Хамгийн их давтагдсан 20 хослолыг сонгох
    const sortedPairs = Array.from(pairCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);

    if (sortedPairs.length === 0) {
      return res.json({ pairs: [] });
    }

    // 4. Бүтээгдэхүүний ID-аар нэрийг нь олох
    const productIds = new Set();
    sortedPairs.forEach(([key]) => {
      const [p1, p2] = key.split('-');
      productIds.add(p1);
      productIds.add(p2);
    });

    const products = await Product.find({ _id: { $in: Array.from(productIds) } })
      .select("name")
      .lean();
      
    const productMap = new Map(products.map(p => [p._id.toString(), p.name]));

    // 5. Эцсийн үр дүнг бэлтгэх
    const result = sortedPairs.map(([key, count]) => {
      const [p1_id, p2_id] = key.split('-');
      return {
        productA: productMap.get(p1_id) || "Тодорхойгүй",
        productB: productMap.get(p2_id) || "Тодорхойгүй",
        count: count
      };
    });

    res.json({ pairs: result });

  } catch (e) {
    res.status(500).json({ message: "Алдаа: " + e.message });
  }
};