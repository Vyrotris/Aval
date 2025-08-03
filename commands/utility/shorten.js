const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getColor } = require('../../misc/colorUtil');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shorten')
        .setDescription('Shorten a URL')
        .setIntegrationTypes([1])
        .setContexts([0, 1, 2])
        .addStringOption(option =>
            option
                .setName('url')
                .setDescription('The URL to shorten')
                .setRequired(true)
        ),

    async run(interaction) {
        try {
            const url = interaction.options.getString('url');

            try {
                new URL(url);
            } catch {
                return interaction.reply({ content: '❌ Please provide a valid URL.', ephemeral: true });
            }

            await interaction.reply({ content: '⏳ Shortening your URL...', fetchReply: true });

            const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
            const shortUrl = await response.text();

            const embed = new EmbedBuilder()
                .setTitle('URL Shortened')
                .setColor(getColor('secondary'))
                .addFields(
                    { name: 'Original URL', value: url },
                    { name: 'Shortened URL', value: shortUrl }
                )
                .setFooter({ text: `Requested by ${interaction.user.username}` })
                .setTimestamp();

            await interaction.editReply({ content: '', embeds: [embed] });

        } catch (err) {
            console.error(err);
            await interaction.editReply('❌ Something went wrong while shortening the URL.');
        }
    }
};