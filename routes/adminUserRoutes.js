import express from 'express';
import db from '../config/db.js';
import dotenv from 'dotenv';
import authMiddleware from '../middleware/authMiddleware.js';
import bcrypt from 'bcryptjs';
import {User} from '../models/User.js';
import {Settings} from '../models/Settings.js';

dotenv.config({ path: '.env.local' ?? '.env' });

const router = express.Router();

router.delete('/:id', authMiddleware.adminAuthenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const [userToDeleteDBResult] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
        const userToDeleteDB = userToDeleteDBResult[0];
        if (!userToDeleteDB) {
            return res.status(404).json({ message: 'User not found' });
        }
        const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const userToDelete = User.fromJson(userToDeleteDB);
        res.status(200).json({ message: 'User ' + userToDelete.email + ' deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/:id', authMiddleware.adminAuthenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const [userDBResult] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
        const [userSettingsDBResult] = await db.query('SELECT * FROM settings WHERE user_id = ?', [id]);
        const userDB = userDBResult;
        const userSettingsDB = userSettingsDBResult;

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
});

router.put('/:id', authMiddleware.adminAuthenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { nickname, password, email } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            'UPDATE users SET company_name = ?, password = ?, email = ? WHERE id = ?',
            [nickname, hashedPassword, email, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const [updatedUserDBResult] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
        const updatedUserDB = updatedUserDBResult[0];
        const userUpdated = User.fromJson(updatedUserDB);

        res.status(200).json(userUpdated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/', authMiddleware.adminAuthenticate, async (req, res) => {
    try {
        const [usersResult] = await db.query('SELECT * FROM users');
        res.status(200).json({ items: usersResult });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;