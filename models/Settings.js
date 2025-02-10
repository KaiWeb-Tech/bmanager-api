import db from "../config/db.js";

export class Settings {
    constructor(id, user_id, theme, timezone, notifications, language, created_at, updated_at) {
        this.id = id;
        this.user_id = user_id;
        this.theme = theme;
        this.timezone = timezone;
        this.notifications = notifications;
        this.language = language;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    static fromJson(json) {
        return new Settings(json.id, json.user_id, json.theme, json.timezone, json.notifications, json.language, json.created_at, json.updated_at);
    }

    static async createSettings(userId, theme, timezone, notifications, language) {
        const [result] = await db.query(
            'INSERT INTO settings (user_id, theme, timezone, notifications, language) VALUES ($1, $2, $3, $4, $5)',
            [userId, theme, timezone, notifications, language]
        );
        return result.insertId;
    }

    toJson() {
        return {
            id: this.id,
            user_id: this.user_id,
            theme: this.theme,
            timezone: this.timezone,
            notifications: this.notifications,
            language: this.language,
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }
}