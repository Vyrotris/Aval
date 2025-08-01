const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();

require('dotenv').config();
const clientId = process.env.AUTH_CLIENT_ID;
const clientSecret = process.env.AUTH_CLIENT_SECRET;
const redirectUri = 'https://avalauth.vyrotris.com/callback';

const dbPath = path.join(__dirname, '..', 'data', 'authorized.db');
const db = new sqlite3.Database(dbPath);

db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    access_token TEXT,
    guild_count INTEGER,
    last_updated INTEGER
)`);

app.get('/callback', async (req, res) => {
    const code = req.query.code;
    const userId = req.query.state;
    if (!code || !userId) return res.send('❌ Missing code or state.');

    try {
        const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: 'authorization_code',
                code,
                redirect_uri: redirectUri
            })
        });

        const tokenData = await tokenResponse.json();
        if (!tokenData.access_token) return res.send('❌ Failed to get access token.');

        const guildsResponse = await fetch('https://discord.com/api/users/@me/guilds', {
            headers: {
                Authorization: `${tokenData.token_type} ${tokenData.access_token}`
            }
        });

        const guilds = await guildsResponse.json();
        const guildCount = Array.isArray(guilds) ? guilds.length : 0;

        db.run(
            `INSERT OR REPLACE INTO users (id, access_token, guild_count, last_updated) VALUES (?, ?, ?, ?)`,
            [userId, tokenData.access_token, guildCount, Date.now()],
            (err) => {
                if (err) console.error(err);
            }
        );

        res.send(`You are in **${guildCount}** servers. You can now return to Discord and run /guildcount again.`);

    } catch (err) {
        console.error(err);
        res.send('Error fetching guild count.');
    }
});

app.listen(3500, () => console.log('ServerCount API running on port 3500'));
