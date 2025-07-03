import User from '../models/User.js';
import Order from "../models/Order.js";

// Хүргэлтийн ажилтан шинээр бүртгэх
export const createDeliveryStaff = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Имэйл бүртгэлтэй байна" });

    const user = await User.create({
      name,
      email,
      password,
      role: "delivery"
    });
    res.status(201).json({ message: "Хүргэлтийн ажилтан амжилттай бүртгэгдлээ", user });
  } catch (err) {
    res.status(500).json({ message: "Алдаа гарлаа", error: err.message });
  }
};

// Бүх хүргэлтийн ажилтан авах
export const getDeliveryStaff = async (req, res) => {
  const staff = await User.find({ role: "delivery" });
  res.json(staff);
};

export const getDeliveryOrders = async (req, res) => {
  try {
    const orders = await Order.find({ delivery: req.user._id }).populate("user");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  try {
    const order = await Order.findOneAndUpdate(
      { _id: orderId, delivery: req.user._id },
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};