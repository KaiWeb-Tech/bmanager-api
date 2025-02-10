import express from 'express';
import db from '../config/db.js';
import dotenv from 'dotenv';
import authMiddleware from '../middleware/authMiddleware.js';
import bcrypt from 'bcryptjs';
import {User} from '../models/User.js';
import {Settings} from '../models/Settings.js';
import jwt from "jsonwebtoken";
import {Themes} from "../constants/Themes.js";

// dotenv.config({ path: '.env.local' });
dotenv.config();

const router = express.Router();

router.get('/', authMiddleware.authenticateToken, async (req, res) => {
    try {
        const id = req.user.uid
        const [userDB] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
        const [userSettingsDB] = await db.query('SELECT * FROM settings WHERE user_id = ?', [id]);

        if (userDB.length === 0) {
            return res.status(404).json({message: 'User not found'});
        }

        const settings = Settings.fromJson(userSettingsDB[0]);
        const user = User.fromJson(userDB[0]);
        user.settings = settings;

        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
});

router.put('/', authMiddleware.authenticateToken, async (req, res) => {
    try {
        const id = req.user.uid

        const {
            nickname,
            email,
        } = req.body;

        const updates = []
        const values = []

        if (nickname !== undefined) {
            updates.push('nickname = ?')
            values.push(nickname)
        }

        if (email !== undefined) {
            updates.push('email = ?')
            values.push(email)
        }

        values.push(id)

        const query = `
            UPDATE users
            SET ${updates.join(', ')}
            WHERE id = ?
        `;

        const [user] = await db.query(query, values);

        if (user.affectedRows === 0) {
            return res.status(404).json({message: 'User not found'});
        }

        const [updatedUserDB] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
        const userUpdated = User.fromJson(updatedUserDB[0]);

        res.status(200).json(userUpdated);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
});

router.put('/settings', authMiddleware.authenticateToken, async (req, res) => {
    try {
        const id = req.user.uid

        const {
            theme,
            timezone,
            notifications,
            language,
        } = req.body;

        const updates = []
        const values = []

        if (theme !== undefined) {
            const themes = []
            for (const themeKey in Themes) {
                themes.push(Themes[themeKey]);
            }

            if (!themes.includes(theme)) {
                return res.status(400).json({message: 'Invalid theme'});
            }
            updates.push('theme = ?')
            values.push(theme)
        }

        if (timezone !== undefined) {
            updates.push('timezone = ?')
            values.push(timezone)
        }

        if (notifications !== undefined) {
            updates.push('notifications = ?')
            values.push(notifications)
        }

        if (language !== undefined) {
            updates.push('language = ?')
            values.push(language)
        }

        values.push(id)

        const query = `
            UPDATE settings
            SET ${updates.join(', ')}
            WHERE user_id = ?
        `;

        const [settings] = await db.query(query, values);

        if (settings.affectedRows === 0) {
            return res.status(404).json({message: 'Settings not found'});
        }

        const [updatedSettingsDB] = await db.query('SELECT * FROM settings WHERE user_id = ?', [id]);
        const settingsUpdated = Settings.fromJson(updatedSettingsDB[0]);

        res.status(200).json(settingsUpdated);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
});

export default router;