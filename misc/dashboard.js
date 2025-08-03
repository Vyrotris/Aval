const express = require('express');
const path = require('path');
require('dotenv').config();
const session = require('express-session');
const bodyParser = require('body-parser');
const fs = require('fs');
const Database = require('better-sqlite3');

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'guildSettings.db');
const db = new Database(dbPath);

db.prepare(`
  CREATE TABLE IF NOT EXISTS guild_settings (
    guild_id TEXT PRIMARY KEY,
    autorole_role_id TEXT
  )
`).run();

function getGuildSettings(guildId) {
  return (
    db.prepare(`SELECT * FROM guild_settings WHERE guild_id = ?`).get(guildId) || {
      guild_id: guildId,
      autorole_role_id: null,
    }
  );
}

function setGuildSettings(guildId, roleId) {
  db.prepare(
    `
    INSERT INTO guild_settings (guild_id, autorole_role_id)
    VALUES (?, ?)
    ON CONFLICT(guild_id) DO UPDATE SET autorole_role_id = excluded.autorole_role_id
  `
  ).run(guildId, roleId || null);
}

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.set('views', __dirname);

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'supersecret',
    resave: false,
    saveUninitialized: false,
  })
);

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.AUTH_CLIENT_SECRET;
const redirectUri = process.env.DASHBOARD_REDIRECT_URI;
const botToken = process.env.TOKEN;

app.get('/login', (req, res) => {
  const url = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=identify%20guilds`;
  res.redirect(url);
});

app.get('/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.send('No code provided');

  try {
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });
    const tokenData = await tokenResponse.json();

    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `${tokenData.token_type} ${tokenData.access_token}` },
    });
    const user = await userResponse.json();

    const guildsResponse = await fetch('https://discord.com/api/users/@me/guilds', {
      headers: { Authorization: `${tokenData.token_type} ${tokenData.access_token}` },
    });
    const guilds = await guildsResponse.json();

    const botGuildsResponse = await fetch('https://discord.com/api/users/@me/guilds', {
      headers: { Authorization: `Bot ${botToken}` },
    });
    const botGuilds = await botGuildsResponse.json();
    const botGuildIds = new Set(botGuilds.map((g) => g.id));

    const filteredGuilds = guilds.filter((g) => {
      const hasAdmin = (g.permissions & 0x8) === 0x8;
      return hasAdmin && botGuildIds.has(g.id);
    });

    req.session.user = user;
    req.session.guilds = filteredGuilds;
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.send('Error during login.');
  }
});

app.get('/dashboard', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const rolesMap = {};

  for (const guild of req.session.guilds) {
    try {
      const rolesRes = await fetch(`https://discord.com/api/v10/guilds/${guild.id}/roles`, {
        headers: { Authorization: `Bot ${botToken}` },
      });
      const roles = await rolesRes.json();
      rolesMap[guild.id] = roles.filter((r) => r.name !== '@everyone');
    } catch (err) {
      console.error(`Failed to fetch roles for guild ${guild.id}`, err);
      rolesMap[guild.id] = [];
    }
  }

  const guildSettingsMap = {};
  req.session.guilds.forEach((g) => {
    guildSettingsMap[g.id] = getGuildSettings(g.id);
  });

  res.render('dashboard', {
    user: req.session.user,
    guilds: req.session.guilds,
    roles: rolesMap,
    settings: guildSettingsMap,
  });
});

app.post('/dashboard/save', (req, res) => {
  const { guildId, autoroleRole } = req.body;
  if (!req.session.user) return res.status(403).send('Unauthorized');

  setGuildSettings(guildId, autoroleRole || null);
  res.redirect('/dashboard');
});

app.listen(process.env.SERVERCOUNT_API_PORT || 3040, () => console.log('Dashboard running'));