const express = require('express');
const path = require('path');
require('dotenv').config();
const { setUserGuildCount } = require('./guildCountDB');

const app = express();

app.get('/', (req, res) => {
  res.redirect('/callback');
});

app.set('views', path.join(__dirname));
app.set('view engine', 'ejs');

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.AUTH_CLIENT_SECRET;
const redirectUri = process.env.REDIRECT_URI;

app.get('/callback', async (req, res) => {
  const code = req.query.code;
  const userId = req.query.state;

  if (!code || !userId) {
    return res.render('response', {
      isError: true,
      heading: 'Error',
      message: 'Missing <strong>code</strong> or <strong>state</strong>.',
      extraMessage: null,
    });
  }

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

    if (!tokenData.access_token) {
      console.error(tokenData);
      return res.render('response', {
        isError: true,
        heading: 'Error',
        message: 'Failed to get access token.',
        extraMessage: null,
      });
    }

    const guildsResponse = await fetch('https://discord.com/api/users/@me/guilds', {
      headers: {
        Authorization: `${tokenData.token_type} ${tokenData.access_token}`,
      },
    });

    const guilds = await guildsResponse.json();
    const guildCount = Array.isArray(guilds) ? guilds.length : 0;

    await setUserGuildCount(userId, guildCount, {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: Date.now() + tokenData.expires_in * 1000,
    });

    res.render('response', {
      isError: false,
      heading: 'Saved Successfully',
      message: `You are currently in <strong>${guildCount}</strong> servers.`,
      extraMessage: 'Return to Discord and run <code>/servercount</code> again.',
    });
  } catch (err) {
    console.error(err);
    res.render('response', {
      isError: true,
      heading: 'Error',
      message: 'Error fetching guild count.',
      extraMessage: null,
    });
  }
});

app.listen(process.env.SERVERCOUNT_API_PORT, () => console.log('ServerCount API running'));
