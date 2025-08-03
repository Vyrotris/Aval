const { SlashCommandBuilder } = require('discord.js');

const originalUri = process.env.DASHBOARD_REDIRECT_URI;
const url = new URL(originalUri);
url.pathname = '/dashboard';
const dashboardRedirectUri = url.toString();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dashboard')
        .setDescription('Open your dashboard')
        .setIntegrationTypes([1])
        .setContexts([0, 1, 2]),

    async run(interaction) {
        return interaction.reply({
            content: `Click here to open your dashboard: [Dashboard Link](${dashboardRedirectUri})`,
            ephemeral: true
        });
    }
};