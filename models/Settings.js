import db from "../config/db.js";

export class Settings {
    constructor(id, user_id, theme, timezone, notifications, language, api_key, token, vf_token, vf_account, created_at, updated_at) {
        this.id = id;
        this.user_id = user_id;
        this.theme = theme;
        this.timezone = timezone;
        this.notifications = notifications;
        this.language = language;
        this.api_key = api_key;
        this.token = token;
        this.vf_token = vf_token;
        this.vf_account = vf_account;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    static fromJson(json) {
        return new Settings(
            json.id,
            json.user_id,
            json.theme,
            json.timezone,
            json.notifications,
            json.language,
            json.api_key,
            json.token,
            json.vf_token,
            json.vf_account,
            json.created_at,
            json.updated_at
        );
    }

    static async createSettings(userId, theme, timezone, notifications, language) {
        // Exécuter la requête SQL
        const result = await db.query(
            'INSERT INTO settings (user_id, theme, timezone, notifications, language) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [userId, theme, timezone, notifications, language]
        );

        return result.rows[0]?.id;
    }

    toJson() {
        return {
            id: this.id,
            user_id: this.user_id,
            theme: this.theme,
            timezone: this.timezone,
            notifications: this.notifications,
            language: this.language,
            api_key: this.api_key,
            token: this.token,
            vf_token: this.vf_token,
            vf_account: this.vf_account,
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }
}