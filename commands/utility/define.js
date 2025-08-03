const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getColor } = require('../../misc/colorUtil');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('define')
        .setDescription('Get the Urban Dictionary definition of a word')
        .addStringOption(option =>
            option.setName('word')
                .setDescription('Word to define')
                .setRequired(true)
        )
        .setIntegrationTypes([1])
        .setContexts([0, 1, 2]),

    async run(interaction) {
        function boldifyBrackets(text) {
            return text.replace(/\[([^\]]+)\]/g, '**$1**');
        }

        try {
            await interaction.deferReply();

            const word = interaction.options.getString('word');
            const res = await fetch(`https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(word)}`);
            if (!res.ok) {
                return await interaction.editReply('❌ Failed to fetch definition.');
            }
            const data = await res.json();

            if (!data.list || data.list.length === 0) {
                return await interaction.editReply(`❌ No definitions found for **${word}**.`);
            }

            const definition = boldifyBrackets(data.list[0].definition).substring(0, 4096);
            const example = data.list[0].example
                ? boldifyBrackets(data.list[0].example).substring(0, 1024)
                : 'No example provided.';

            const embed = new EmbedBuilder()
                .setTitle(word)
                .setDescription(definition)
                .addFields({ name: 'Example', value: example })
                .setColor(getColor('info'))
                .setFooter({ text: `Requested by ${interaction.user.username}` })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            await interaction.editReply('❌ Something went wrong while fetching the definition.');
        }
    }
};