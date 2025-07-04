import Notification from '../models/Notification.js';

export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({ userId }).sort({ date: -1 });
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ message: "Мэдэгдэл уншихад алдаа гарлаа" });
  }
};

// Бүх notification-ийг уншсан болгох
export const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, read: false }, { $set: { read: true } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Уншсан төлөвт оруулахад алдаа гарлаа" });
  }
};