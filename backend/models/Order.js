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
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.model('Order', orderSchema);
