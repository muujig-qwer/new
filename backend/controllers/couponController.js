import Coupon from '../models/Coupon.js';

// Админ купон үүсгэх
export const createCoupon = async (req, res) => {
  const { code, discount, expires, assignedTo, categories } = req.body;
  try {
    const coupon = new Coupon({ code, discount, expires, assignedTo, categories });
    await coupon.save();
    res.status(201).json({ message: 'Купон амжилттай үүслээ', coupon });
  } catch (err) {
    res.status(400).json({ message: 'Алдаа гарлаа', error: err.message });
  }
};

// Купон шалгах (user ашиглах)
export const applyCoupon = async (req, res) => {
  const { code, userEmail } = req.body;
  const coupon = await Coupon.findOne({ code });
  if (!coupon) return res.status(404).json({ message: 'Купон олдсонгүй' });
  if (coupon.expires < new Date()) return res.status(400).json({ message: 'Купоны хугацаа дууссан' });
  if (coupon.assignedTo.length && !coupon.assignedTo.includes(userEmail)) {
    return res.status(403).json({ message: 'Танд энэ купон олгогдоогүй' });
  }
  res.json({ discount: coupon.discount, message: 'Купон зөв байна!' });
};

export const listCoupons = async (req, res) => {
  const coupons = await Coupon.find().populate('categories', 'name').sort({ createdAt: -1 });
  res.json({ coupons });
};

export const getUserCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({
      $or: [
        { assignedTo: req.user.email },
        { assignedTo: { $size: 0 } }, // бүх хэрэглэгчид зориулсан купон
      ]
    });
    res.json({ coupons });
  } catch (err) {
    res.status(500).json({ message: 'Серверийн алдаа' });
  }
};