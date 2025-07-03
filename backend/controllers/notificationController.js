import Notification from '../models/Notification.js';

export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id; // Auth middleware-ээр user-г авдаг гэж үзэв
    const notifications = await Notification.find({ userId }).sort({ date: -1 });
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ message: "Мэдэгдэл уншихад алдаа гарлаа" });
  }
};