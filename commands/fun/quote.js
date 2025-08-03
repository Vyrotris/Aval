const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getColor } = require('../../misc/colorUtil');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quote')
        .setDescription('Get a random inspirational quote')
        .setIntegrationTypes([1])
        .setContexts([0, 1, 2]),

    async run(interaction) {
        try {
            await interaction.deferReply();

            // Using ZenQuotes API (valid SSL)
            const res = await fetch('https://zenquotes.io/api/random');
            if (!res.ok) {
                return await interaction.editReply('❌ Failed to fetch quote.');
            }

            const data = await res.json();
            const quoteText = `${data[0].q}\n\n— *${data[0].a}*`;

            const embed = new EmbedBuilder()
                .setTitle('💡 Inspirational Quote')
                .setDescription(quoteText)
                .setColor(getColor('secondary'))
                .setFooter({ text: `Requested by ${interaction.user.username}` })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            await interaction.editReply('❌ Something went wrong while fetching the quote.');
        }
    }
};