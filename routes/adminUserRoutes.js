import express from 'express';
import db from '../config/db.js';
import dotenv from 'dotenv';
import authMiddleware from '../middleware/authMiddleware.js';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Settings } from '../models/Settings.js';

dotenv.config();

const router = express.Router();

router.delete('/:id', authMiddleware.adminAuthenticate, async (req, res) => {
    try {
        const { id } = req.params;

        const [userToDeleteDB] = await db.query('SELECT * FROM users WHERE id = $1', [id]);
        const [result] = await db.query('DELETE FROM users WHERE id = $1', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userToDelete = User.fromJson(userToDeleteDB[0]);

        res.status(200).json({ message: 'User ' + userToDelete.email + ' deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/:id', authMiddleware.adminAuthenticate, async (req, res) => {
    try {
        const { id } = req.params;

        const [userDB] = await db.query('SELECT * FROM users WHERE id = $1', [id]);
        const [userSettingsDB] = await db.query('SELECT * FROM settings WHERE user_id = $1', [id]);

        if (userDB.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const settings = Settings.fromJson(userSettingsDB[0]);
        const user = User.fromJson(userDB[0]);
        user.settings = settings;

        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}, authMiddleware.adminAuthenticate);

router.put('/:id', authMiddleware.adminAuthenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { nickname, password, email } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const [user] = await db.query(
            'UPDATE users SET nickname = $1, password = $2, email = $3 WHERE id = $4',
            [nickname, hashedPassword, email, id]
        );

        if (user.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const [updatedUserDB] = await db.query('SELECT * FROM users WHERE id = $1', [id]);
        const userUpdated = User.fromJson(updatedUserDB[0]);

        res.status(200).json(userUpdated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/', authMiddleware.adminAuthenticate, async (req, res) => {
    try {
        const [users] = await db.query('SELECT * FROM users');

        res.status(200).json({items: users});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;