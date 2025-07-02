import User from "../models/User.js";

// Хэтэвчинд мөнгө нэмэх
export const addMoneyToWallet = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: "Буруу дүн" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "Хэрэглэгч олдсонгүй" });

    user.wallet = (user.wallet || 0) + amount;
    await user.save();

    res.json({ wallet: user.wallet });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Серверийн алдаа" });
  }
};

// Хэтэвчний үлдэгдэл авах
export const getWalletBalance = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ wallet: user.wallet || 0 });
};