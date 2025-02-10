-- Création de la base de données
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'bmanager_api') THEN
CREATE DATABASE bmanager_api;
END IF;
END $$;

-- Connectez-vous à la base de données créée
\c bmanager_api;

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users
(
    id            SERIAL PRIMARY KEY,
    company_name  VARCHAR(255) NOT NULL,
    password      VARCHAR(255) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    auth_provider VARCHAR(10) DEFAULT 'local',
    roles         VARCHAR(255) NOT NULL DEFAULT 'ROLE_USER',
    api_key       VARCHAR(255),
    token         VARCHAR(255),
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Déclencheur pour mettre à jour la colonne updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Table des paramètres utilisateur
CREATE TABLE IF NOT EXISTS settings
(
    id            SERIAL PRIMARY KEY,
    user_id       INT NOT NULL,
    theme         VARCHAR(50) DEFAULT 'light',
    timezone      VARCHAR(50) DEFAULT 'UTC',
    notifications BOOLEAN DEFAULT FALSE,
    language      VARCHAR(10) DEFAULT 'fr',
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Déclencheur pour mettre à jour la colonne updated_at automatiquement
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();