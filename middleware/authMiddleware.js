import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Roles } from '../constants/Roles.js';

dotenv.config({ path: '.env.local' ?? '.env' });
// dotenv.config();

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token.' });
        }
        req.user = user;
        next();
    });
};

const adminAuthenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token.' });
        }

        if (!user.roles.includes(Roles.ADMIN)) {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        req.user = user;
        next();
    });
};

export default {
    authenticateToken,
    adminAuthenticate
};