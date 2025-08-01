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
        last_updated INTEGER
      )
    `, (err) => {
      if (err) console.error('Failed to create users table:', err);
    });
  }
});

function getUserGuildCount(userId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT guild_count, last_updated FROM users WHERE id = ?', [userId], (err, row) => {
      if (err) return reject(err);
      resolve(row || null);
    });
  });
}

function setUserGuildCount(userId, guildCount) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT OR REPLACE INTO users (id, guild_count, last_updated) VALUES (?, ?, ?)`,
      [userId, guildCount, Date.now()],
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
};
