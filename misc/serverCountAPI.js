const express = require('express');
require('dotenv').config();
const { setUserGuildCount } = require('./guildCountDB');

const app = express();

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.AUTH_CLIENT_SECRET;
const redirectUri = process.env.REDIRECT_URI;

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
        if (!tokenData.access_token) {
            console.error(tokenData);
            return res.send('❌ Failed to get access token.');
        }

        const guildsResponse = await fetch('https://discord.com/api/users/@me/guilds', {
            headers: {
                Authorization: `${tokenData.token_type} ${tokenData.access_token}`
            }
        });
        const guilds = await guildsResponse.json();
        const guildCount = Array.isArray(guilds) ? guilds.length : 0;

        await setUserGuildCount(userId, guildCount, {
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            expires_at: Date.now() + tokenData.expires_in * 1000
        });

        res.send(`
<!DOCTYPE html>
<html>
  <head>
    <title>Server Count Saved</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: #0a0a0a;
        color: #ffffff;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      
      .container {
        background: #111111;
        border: 1px solid #333333;
        border-radius: 12px;
        padding: 32px;
        max-width: 400px;
        width: 100%;
        text-align: center;
        position: relative;
        animation: slideUp 0.6s ease-out;
      }
      
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .success-icon {
        width: 48px;
        height: 48px;
        border: 2px solid #22c55e;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 24px;
        position: relative;
        animation: checkmark 0.8s ease-out 0.3s both;
      }
      
      .checkmark-svg {
        width: 20px;
        height: 20px;
        opacity: 0;
        animation: fadeIn 0.4s ease-out 0.6s both;
      }
      
      .checkmark-path {
        stroke: #22c55e;
        stroke-width: 2.5;
        stroke-linecap: round;
        stroke-linejoin: round;
        fill: none;
        stroke-dasharray: 20;
        stroke-dashoffset: 20;
        animation: drawCheck 0.6s ease-out 0.8s both;
      }
      
      @keyframes drawCheck {
        to {
          stroke-dashoffset: 0;
        }
      }
      
      @keyframes checkmark {
        0% {
          transform: scale(0);
          border-color: #333333;
        }
        50% {
          transform: scale(1.1);
          border-color: #22c55e;
        }
        100% {
          transform: scale(1);
          border-color: #22c55e;
        }
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      h1 {
        font-size: 24px;
        font-weight: 600;
        color: #ffffff;
        margin-bottom: 16px;
        letter-spacing: -0.025em;
      }
      
      p {
        color: #a3a3a3;
        font-size: 16px;
        line-height: 1.5;
        margin-bottom: 12px;
      }
      
      p:last-child {
        margin-bottom: 0;
      }
      
      strong {
        color: #ffffff;
        font-weight: 600;
      }
      
      code {
        background: #1a1a1a;
        border: 1px solid #333333;
        color: #e5e5e5;
        padding: 4px 8px;
        border-radius: 6px;
        font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
        font-size: 14px;
        font-weight: 500;
        display: inline-block;
        margin: 0 2px;
        transition: all 0.2s ease;
      }
      
      code:hover {
        background: #222222;
        border-color: #444444;
        transform: translateY(-1px);
      }
      
      .divider {
        width: 100%;
        height: 1px;
        background: #333333;
        margin: 20px 0;
        opacity: 0.5;
      }
      
      @media (max-width: 480px) {
        .container {
          padding: 24px;
          margin: 16px;
        }
        
        h1 {
          font-size: 20px;
        }
        
        p {
          font-size: 14px;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="success-icon">
        <svg class="checkmark-svg" viewBox="0 0 20 20">
          <path class="checkmark-path" d="M4 10l4 4 8-8" />
        </svg>
      </div>
      <h1>Saved Successfully</h1>
      <p>You are currently in <strong>${guildCount}</strong> servers.</p>
      <div class="divider"></div>
      <p>Return to Discord and run <code>/servercount</code> again.</p>
    </div>
  </body>
</html>
        `);
    } catch (err) {
        console.error(err);
        res.send('❌ Error fetching guild count.');
    }
});

app.listen(3500, () => console.log('ServerCount API running on port 3500'));