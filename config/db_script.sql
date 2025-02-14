-- Création de la base de données
CREATE DATABASE IF NOT EXISTS bmanager_api;
USE bmanager_api;

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users
(
    id            INT AUTO_INCREMENT PRIMARY KEY,
    company_name  VARCHAR(255) NOT NULL,
    password      VARCHAR(255) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    auth_provider VARCHAR(10)           DEFAULT 'local',
    roles         VARCHAR(255) NOT NULL DEFAULT 'ROLE_USER',
    created_at    TIMESTAMP             DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP             DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des paramètres utilisateur
CREATE TABLE IF NOT EXISTS settings
(
    id            INT AUTO_INCREMENT PRIMARY KEY,
    user_id       INT NOT NULL,
    theme         VARCHAR(50) DEFAULT 'light',
    timezone      VARCHAR(50) DEFAULT 'UTC',
    notifications BOOLEAN     DEFAULT FALSE,
    language      VARCHAR(10) DEFAULT 'fr',
    api_key       VARCHAR(255),
    token         VARCHAR(255),
    vf_token      VARCHAR(255),
    created_at    TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP   DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);