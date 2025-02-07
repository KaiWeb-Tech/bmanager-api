import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import adminUserRoutes from './routes/adminUserRoutes.js';
import authenticateToken from './middleware/authMiddleware.js';
import userRoutes from "./routes/userRoutes.js";

dotenv.config({ path: '.env.local' });

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', adminUserRoutes);
app.use('/api/v1/profile', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});