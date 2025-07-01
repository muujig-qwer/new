import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discount: { type: Number, required: true },
  expires: { type: Date, required: true },
  assignedTo: [{ type: String }],
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }], // нэмэлт
});

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;