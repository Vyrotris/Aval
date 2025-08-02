const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'authorized.db');

if (fs.existsSync(dbPath)) {
  try {
    fs.unlinkSync(dbPath);
    console.log('Deleted old database file to start fresh.');
  } catch (err) {
    console.error('Failed to delete old database file:', err);
  }
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to open DB:', err);
  } else {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        guild_count INTEGER,
        last_updated INTEGER,
        access_token TEXT,
        refresh_token TEXT,
        expires_at INTEGER
      )
    `, (err) => {
      if (err) console.error('Failed to create users table:', err);
    });
  }
});

setInterval(() => {
  const oneMonthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  db.run(`DELETE FROM users WHERE last_updated < ?`, [oneMonthAgo], (err) => {
    if (err) {
      console.error('Failed to cleanup old user data:', err);
    }
  });
}, 6 * 60 * 60 * 1000);

function getUserGuildCount(userId) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT guild_count, last_updated, access_token, refresh_token, expires_at FROM users WHERE id = ?',
      [userId],
      (err, row) => {
        if (err) return reject(err);
        resolve(row || null);
      }
    );
  });
}

function setUserGuildCount(userId, guildCount, tokenData = {}) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT OR REPLACE INTO users (id, guild_count, last_updated, access_token, refresh_token, expires_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        guildCount,
        Date.now(),
        tokenData.access_token || null,
        tokenData.refresh_token || null,
        tokenData.expires_at || null
      ],
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
}

function updateUserTokens(userId, tokenData) {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE users
       SET access_token = ?, refresh_token = ?, expires_at = ?, last_updated = ?
       WHERE id = ?`,
      [
        tokenData.access_token || null,
        tokenData.refresh_token || null,
        tokenData.expires_at || null,
        Date.now(),
        userId
      ],
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
}

module.exports = {
  getUserGuildCount,
  setUserGuildCount,
  updateUserTokens
};