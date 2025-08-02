const { SlashCommandBuilder } = require('discord.js');
const { getUserGuildCount, updateUserTokens } = require('../../misc/guildCountDB');

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.AUTH_CLIENT_SECRET;

async function refreshAccessToken(refresh_token) {
    const response = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'refresh_token',
            refresh_token
        })
    });
    return await response.json();
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('servercount')
        .setDescription('Check how many servers you are in')
        .setIntegrationTypes([1])
        .setContexts([1, 2]),

    async run(interaction) {
        const userId = interaction.user.id;
        const row = await getUserGuildCount(userId);

        if (!row) {
            const redirectUri = encodeURIComponent(process.env.REDIRECT_URI);
            const oauthUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=identify%20guilds&state=${userId}`;
            return interaction.reply({
                content: `Please click [here to authorize](${oauthUrl}). Once you authorize, run this command again.`,
                ephemeral: true
            });
        }

        let accessToken = row.access_token;

        if (Date.now() > row.expires_at - 30000) {
            const tokenData = await refreshAccessToken(row.refresh_token);
            if (!tokenData.access_token) {
                const redirectUri = encodeURIComponent(process.env.REDIRECT_URI);
                const oauthUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=identify%20guilds&state=${userId}`;
                return interaction.reply({
                    content: `Please click [here to re-authorize](${oauthUrl}).`,
                    ephemeral: true
                });
            }
            accessToken = tokenData.access_token;
            await updateUserTokens(userId, {
                access_token: tokenData.access_token,
                refresh_token: tokenData.refresh_token,
                expires_at: Date.now() + (tokenData.expires_in - 30) * 1000
            });
        }

        const guildsResponse = await fetch('https://discord.com/api/users/@me/guilds', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        const guilds = await guildsResponse.json();
        const guildCount = Array.isArray(guilds) ? guilds.length : 0;

        return interaction.reply({
            content: `You are in **${guildCount}** servers.`,
            ephemeral: false
        });
    }
};