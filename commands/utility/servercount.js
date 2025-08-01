const { SlashCommandBuilder, InteractionResponseFlags } = require('discord.js');

const clientId = process.env.CLIENT_ID;
const redirectUri = encodeURIComponent('https://avalauth.vyrotris.com/callback');

const tempGuildCounts = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('servercount')
        .setDescription('Check how many servers you are in'),

    async run(interaction) {
        const cached = tempGuildCounts.get(interaction.user.id);

        if (cached && (Date.now() - cached.timestamp < 5 * 60 * 1000)) {
            tempGuildCounts.delete(interaction.user.id);
            return interaction.reply({ content: `You are in **${cached.guildCount}** servers.`, ephemeral: true });
        }

        const oauthUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=identify%20guilds&state=${interaction.user.id}`;

        return interaction.reply({
            content: `Please click [here to authorize](${oauthUrl}). Once you authorize, return here and run the command again.`,
            ephemeral: true
        });
    }
};
