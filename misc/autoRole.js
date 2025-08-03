const path = require('path');
const Database = require('better-sqlite3');

const dataDir = path.join(__dirname, '../data');
const dbPath = path.join(dataDir, 'guildSettings.db');
const db = new Database(dbPath);

function getAutoroleForGuild(guildId) {
  const row = db.prepare('SELECT autorole_role_id FROM guild_settings WHERE guild_id = ?').get(guildId);
  return row ? row.autorole_role_id : null;
}

module.exports = (client) => {
  client.on('guildMemberAdd', async (member) => {
    try {
      const autoroleId = getAutoroleForGuild(member.guild.id);
      if (!autoroleId) return;

      const role = member.guild.roles.cache.get(autoroleId);
      if (!role) return;

      await member.roles.add(role);
    } catch (error) {
      console.error(`Failed to assign autorole in guild ${member.guild.id}:`, error);
    }
  });
};