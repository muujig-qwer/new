import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/product.js';
import categoryRoutes from './routes/category.js';
import orderRoutes from './routes/order.js';
import cartRoutes from './routes/cart.js';
import couponRoutes from './routes/coupon.js';
import walletRoutes from './routes/wallet.js'; // wallet route-оо импортлоно
import adminRoutes from './routes/admin.js'; // admin route-оо импортло
import deliveryRoutes from './routes/delivery.js'; // delivery route-оо импортло
import notificationRoutes from './routes/notificationRoutes.js'; // notification route-оо импортло
import reportRoutes from './routes/reportRoutes.js'; // report route-оо импортло
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/coupon', couponRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/delivery', deliveryRoutes); 
app.use('/api/notifications', notificationRoutes); 
app.use('/api/admin/reports', reportRoutes); 
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
