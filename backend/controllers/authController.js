import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body
    const image = req.file ? req.file.filename : ''
    const exist = await User.findOne({ email })
    if (exist) return res.status(400).json({ message: 'Email already exists' })
    const hashed = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, password: hashed, image })
    res.status(201).json(user)
  } catch (err) {
    res.status(500).json({ message: 'Алдаа', error: err.message })
  }
};



export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Wrong password' });

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name }, 
      process.env.JWT_SECRET
    );
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Хэрэглэгч олдсонгүй' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Серверийн алдаа' });
  }
};


export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Хэрэглэгч олдсонгүй' });

    if (req.body.name) user.name = req.body.name;
    if (req.file) user.image = req.file.filename;

    await user.save();

    res.json({ message: 'Профайл амжилттай шинэчлэгдлээ', user: { 
      id: user._id,
      name: user.name,
      email: user.email,
      image: user.image
    }});
  } catch (err) {
    res.status(500).json({ message: 'Серверийн алдаа' });
  }
};


export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select()  // нууц үг харуулахгүй
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: 'Серверийн алдаа' })
  }
}


export const createAdmin = async (req, res) => {
  try {
    // Үүсгэх admin-ийн мэдээлэл request-оос авах
    const { name, email, password } = req.body;

    // Хэрэглэгч байгаа эсэхийг шалгах
    const exist = await User.findOne({ email });
    if (exist) return res.status(400).json({ message: 'Email already exists' });

    // Нууц үгийг хэшлэх
    const hashed = await bcrypt.hash(password, 10);

    // Шинэ админ хэрэглэгч үүсгэх
    const adminUser = new User({
      name,
      email,
      password: hashed,
      role: 'admin',
    });

    await adminUser.save();

    res.status(201).json({ message: 'Admin user created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Wishlist-д нэмэх
export const addToWishlist = async (req, res) => {
  const { productId } = req.body;
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // ObjectId болон string харьцуулалтаас сэргийлэх
    const already = user.wishlist.map(id => id.toString()).includes(productId);
    if (!already) {
      user.wishlist.push(productId);
      await user.save();
    }
    res.json(user.wishlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Wishlist-аас устгах
export const removeFromWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== req.params.productId
    );
    await user.save();
    res.json(user.wishlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Wishlist-ийг авах
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('wishlist');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user.wishlist); 
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserByEmail = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const googleLogin = async (req, res) => {
  const { email, name } = req.body;
  let user = await User.findOne({ email });
  if (!user) {
    // Шинэ хэрэглэгчийг автоматаар бүртгэнэ
    user = await User.create({
      name: name || email.split("@")[0],
      email,
      password: Math.random().toString(36).slice(-8), // random password
      role: "user",
    });
  }
  // JWT-д id, role, email-ийг хамтад нь хийж өгнө
  const token = jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  res.json({ token });
};

// Хэтэвчинд мөнгө нэмэх
export const addMoneyToWallet = async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ message: "Буруу дүн" });

  const user = await User.findById(req.user._id);
  user.wallet = (user.wallet || 0) + amount;
  await user.save();

  res.json({ wallet: user.wallet });
};

// Хэтэвчний үлдэгдэл авах
export const getWalletBalance = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ wallet: user.wallet || 0 });
};

// Хэрэглэгчийн үүрэг (role) солих
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    // зөвшөөрөгдсөн role эсэхийг шалгах
    if (!["user", "admin", "delivery"].includes(role)) {
      return res.status(400).json({ message: "Role буруу байна" });
    }
    const user = await User.findByIdAndUpdate(id, { role }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Role амжилттай солигдлоо", user });
  } catch (err) {
    res.status(500).json({ message: "Серверийн алдаа", error: err.message });
  }
};



