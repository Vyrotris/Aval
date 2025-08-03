const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getColor } = require('../../misc/colorUtil');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription('Send a custom embed with your text as the title')
        .addStringOption(option =>
            option.setName('text')
                .setDescription('The text for the embed title')
                .setRequired(true))
        .setIntegrationTypes([1])
        .setContexts([0, 1, 2]),

    async run(interaction) {
        try {
            await interaction.deferReply();

            const text = interaction.options.getString('text');

            const safeText = text
                .replace(/@everyone/g, '@\u200beveryone')
                .replace(/@here/g, '@\u200bhere');

            const embed = new EmbedBuilder()
                .setTitle(safeText)
                .setColor(getColor('secondary'))
                .setFooter({ text: `Requested by ${interaction.user.username}` })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            await interaction.editReply('Something went wrong while sending the embed.');
        }
    }
};