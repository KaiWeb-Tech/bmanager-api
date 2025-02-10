import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { OAuth2Client } from 'google-auth-library';

// dotenv.config({ path: '.env.local' });
dotenv.config();

const router = express.Router();
const client = new OAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI
});

router.post('/register', async (req, res) => {
    try {
        const { company_name, password, email } = req.body;

        const isExisting = await User.findByEmail(email);
        if (isExisting) {
            return res.status(400).json({ message: 'User already exists' });
        }

        await User.createUser(company_name, email, password);

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.verifyPassword(email, password)

        if (!user || user.auth_provider !== 'local') {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ uid: user.id, email: user.email, companyName: user.company_name, api_key: user.api_key, token: user.token, roles: user.roles }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/google', (req, res) => {
    const authUrl = client.generateAuthUrl({
        access_type: 'offline',
        scope: ['profile', 'email'],
        redirect_uri: process.env.REDIRECT_URI
    });
    res.redirect(authUrl);
});

router.get('/google/callback', async (req, res) => {
    const { code } = req.query;

    try {
        const { tokens } = await client.getToken(code);

        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { email, name } = payload;

        let user = await User.findByEmail(email);
        if (!user) {
            const userId = await User.createUser(name, email, null, true);
            user = await User.findByEmail(email);
        }

        const tokenJWT = jwt.sign({ uid: user.id, email: user.email, companyName: user.company_name, roles: user.roles }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token: tokenJWT });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Authentication failed' });
    }
});

export default router;