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