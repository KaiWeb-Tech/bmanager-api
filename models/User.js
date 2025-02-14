import db from "../config/db.js";
import bcrypt from 'bcryptjs';
import { Settings } from "./Settings.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const defaultSettings = require('../schemas/default_settings.json');

export class User {
    constructor(
        id,
        nickname,
        email,
        roles,
        auth_provider,
        created_at,
        updated_at
    ) {
        this.id = id;
        this.company_name = nickname;
        this.email = email;
        this.roles = roles;
        this.auth_provider = auth_provider;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    static fromJson(json) {
        return new User(json.id, json.company_name, json.email, json.roles, json.auth_provider, json.created_at, json.updated_at);
    }

    static async createUser(companyName, email, password, isGoogleAuth = false) {
        const hashedPassword = isGoogleAuth
            ? await bcrypt.hash(generateRandomPassword(), 10)
            : await bcrypt.hash(password, 10);
        const authProvider = isGoogleAuth ? 'google' : 'local';

        const [result] = await db.query(
            'INSERT INTO users (company_name, email, password, auth_provider) VALUES (?, ?, ?, ?)',
            [companyName, email, hashedPassword, authProvider]
        );

        const userId = result.insertId;

        const settings = await Settings.createSettings(userId, defaultSettings.data.theme, defaultSettings.data.timezone, defaultSettings.data.email_notifications, defaultSettings.data.language);

        return { userId, settingsId: settings };
    }

    static async findByEmail(email) {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (rows.length > 0) {
            return rows[0];
        } else {
            return null;
        }
    }

    static async verifyPassword(email, password) {
        const user = await this.findByEmail(email);
        if (!user) return false;

        const isMatch = await bcrypt.compare(password, user.password);
        return isMatch ? user : null;
    }

    toJson() {
        return {
            id: this.id,
            company_name: this.company_name,
            email: this.email,
            roles: this.roles,
            auth_provider: this.auth_provider,
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }
}

function generateRandomPassword() {
    return Math.random().toString(36).slice(-8); // Génère une chaîne aléatoire de 8 caractères
}