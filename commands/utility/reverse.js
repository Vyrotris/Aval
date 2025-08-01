const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reverse')
        .setDescription('Reverses the text you provide')
        .addStringOption(option =>
            option.setName('text')
                .setDescription('The text to reverse')
                .setRequired(true))
        .setIntegrationTypes([1])
        .setContexts([1, 2]),

    async run(interaction) {
        try {
            const text = interaction.options.getString('text');
            const reversed = text.split('').reverse().join('');

            const safeReversed = reversed
                .replace(/@everyone/g, '@\u200beveryone')
                .replace(/@here/g, '@\u200bhere');

            await interaction.reply({ content: safeReversed, ephemeral: false });
        } catch (err) {
            console.error(err);
            await interaction.reply({ content: 'Something went wrong while reversing the text.', ephemeral: true });
        }
    }
};
