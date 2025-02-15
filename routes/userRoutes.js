import express from 'express';
import db from '../config/db.js';
import dotenv from 'dotenv';
import authMiddleware from '../middleware/authMiddleware.js';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Settings } from '../models/Settings.js';
import jwt from "jsonwebtoken";
import { Themes } from "../constants/Themes.js";

dotenv.config();

const router = express.Router();

router.get('/', authMiddleware.authenticateToken, async (req, res) => {
    try {
        const id = req.user.id;

        const userDBResult = await db.query('SELECT * FROM users WHERE id = $1', [id]);
        const userSettingsDBResult = await db.query('SELECT * FROM settings WHERE user_id = $1', [id]);

        const userDB = userDBResult.rows;
        const userSettingsDB = userSettingsDBResult.rows;

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

router.put('/', authMiddleware.authenticateToken, async (req, res) => {
    try {
        const id = req.user.uid;
        const { nickname, email } = req.body;

        const updates = [];
        const values = [];

        if (nickname !== undefined) {
            updates.push('company_name = $1');
            values.push(nickname);
        }

        if (email !== undefined) {
            updates.push('email = $2');
            values.push(email);
        }

        values.push(id);

        const query = `
            UPDATE users
            SET ${updates.join(', ')}
            WHERE id = $${values.length}
        `;

        const result = await db.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const updatedUserDBResult = await db.query('SELECT * FROM users WHERE id = $1', [id]);
        const updatedUserDB = updatedUserDBResult.rows[0];

        const userUpdated = User.fromJson(updatedUserDB);
        res.status(200).json(userUpdated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/settings', authMiddleware.authenticateToken, async (req, res) => {
    try {
        const id = req.user.uid;
        const { theme, timezone, notifications, language } = req.body;

        const updates = [];
        const values = [];

        if (theme !== undefined) {
            const themes = Object.values(Themes);
            if (!themes.includes(theme)) {
                return res.status(400).json({ message: 'Invalid theme' });
            }
            updates.push('theme = $1');
            values.push(theme);
        }

        if (timezone !== undefined) {
            updates.push('timezone = $2');
            values.push(timezone);
        }

        if (notifications !== undefined) {
            updates.push('notifications = $3');
            values.push(notifications);
        }

        if (language !== undefined) {
            updates.push('language = $4');
            values.push(language);
        }

        values.push(id);

        const query = `
            UPDATE settings
            SET ${updates.join(', ')}
            WHERE user_id = $${values.length}
        `;

        const result = await db.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Settings not found' });
        }

        const updatedSettingsDBResult = await db.query('SELECT * FROM settings WHERE user_id = $1', [id]);
        const updatedSettingsDB = updatedSettingsDBResult.rows[0];

        const settingsUpdated = Settings.fromJson(updatedSettingsDB);
        res.status(200).json(settingsUpdated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;