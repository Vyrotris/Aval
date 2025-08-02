const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'authorized.db');
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

// Optional cleanup: remove tokens for very old data if you want
setInterval(() => {
  const oneMonthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  db.run(`DELETE FROM users WHERE last_updated < ?`, [oneMonthAgo], (err) => {
    if (err) {
      console.error('Failed to cleanup old user data:', err);
    }
  });
}, 6 * 60 * 60 * 1000); // every 6 hours

/**
 * Get guild count and token data for a user
 */
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

/**
 * Save guild count and token info when user first authorizes
 */
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

/**
 * Update tokens without changing guild count
 */
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