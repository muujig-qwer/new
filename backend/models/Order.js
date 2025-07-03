import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cartItems: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true }
    }
  ],
  phone: String,
  note: String,
  location: String,
  totalPrice: Number,
  payWithWallet: Boolean,
  payWithQr: Boolean,
  coupon: {
    code: String,
    discount: Number,
    discountAmount: Number,
  },
  delivery: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Оноогдсон хүргэлтийн ажилтан
  status: { type: String, enum: ["pending", "assigned", "out_for_delivery", "completed"], default: "pending" },
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.model('Order', orderSchema);
