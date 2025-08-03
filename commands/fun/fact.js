const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getColor } = require('../../misc/colorUtil');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fact')
        .setDescription('Get a random fun fact')
        .setIntegrationTypes([1])
        .setContexts([0, 1, 2]),

    async run(interaction) {
        try {
            await interaction.deferReply();

            const res = await fetch('https://uselessfacts.jsph.pl/random.json?language=en');
            if (!res.ok) {
                return await interaction.editReply('❌ Failed to fetch fact.');
            }

            const data = await res.json();
            const factText = data.text;

            const embed = new EmbedBuilder()
                .setTitle('📚 Fun Fact')
                .setDescription(factText)
                .setColor(getColor('info'))
                .setFooter({ text: `Requested by ${interaction.user.username}` })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            await interaction.editReply('❌ Something went wrong while fetching the fact.');
        }
    }
};