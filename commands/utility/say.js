const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Make the bot say something')
        .addStringOption(option =>
            option.setName('text')
                .setDescription('The text to send')
                .setRequired(true))
        .setIntegrationTypes([1])
        .setContexts([0, 1, 2]),

    async run(interaction) {
        try {
            const text = interaction.options.getString('text');

            const safeText = text
                .replace(/@everyone/g, '@\u200beveryone')
                .replace(/@here/g, '@\u200bhere');

            await interaction.reply({ content: safeText, ephemeral: false });

        } catch (err) {
            console.error(err);
            await interaction.reply({ content: 'Something went wrong while sending the message.', ephemeral: true });
        }
    }
};