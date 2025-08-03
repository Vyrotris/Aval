const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getColor } = require('../../misc/colorUtil');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('meme')
        .setDescription('Get a random meme')
        .setIntegrationTypes([1])
        .setContexts([0, 1, 2]),

    async run(interaction) {
        try {
            await interaction.deferReply();

            const res = await fetch('https://meme-api.com/gimme');
            if (!res.ok) {
                return interaction.editReply('Failed to fetch meme.');
            }

            const data = await res.json();

            const embed = new EmbedBuilder()
                .setTitle(data.title)
                .setURL(data.postLink)
                .setImage(data.url)
                .setColor(getColor('secondary'))
                .setFooter({ text: `👍 ${data.ups} | Posted by u/${data.author} in r/${data.subreddit}` })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            await interaction.editReply('❌ Something went wrong fetching the meme.');
        }
    }
};