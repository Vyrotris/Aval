const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const figlet = require('figlet');
const { getColor } = require('../../misc/colorUtil');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ascii')
        .setDescription('Convert text into ASCII art')
        .addStringOption(option =>
            option.setName('text')
                .setDescription('The text to convert')
                .setRequired(true))
        .setIntegrationTypes([1])
        .setContexts([1, 2]),

    async run(interaction) {
        try {
            const inputText = interaction.options.getString('text');

            if (inputText.length > 20) {
                return interaction.reply({ content: 'Text is too long. Please use 20 characters or less.', ephemeral: true });
            }

            figlet(inputText, (err, asciiArt) => {
                if (err) {
                    console.error(err);
                    return interaction.reply({ content: '❌ Failed to generate ASCII art.', ephemeral: true });
                }

                if (asciiArt.length > 2000) {
                    return interaction.reply({ content: 'ASCII art output is too long to send.', ephemeral: true });
                }

                const embed = new EmbedBuilder()
                    .setTitle('ASCII Art')
                    .setColor(getColor('primary'))
                    .setDescription('```' + asciiArt + '```')
                    .setFooter({ text: `Requested by ${interaction.user.username}` })
                    .setTimestamp();

                interaction.reply({ embeds: [embed] });
            });

        } catch (err) {
            console.error(err);
            await interaction.reply({ content: '❌ Something went wrong while generating ASCII art.', ephemeral: true });
        }
    }
};