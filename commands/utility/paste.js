const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getColor } = require('../../misc/colorUtil');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('paste')
        .setDescription('Upload text to a paste service and get a shareable link')
        .setIntegrationTypes([1])
        .setContexts([0, 1, 2])
        .addStringOption(option =>
            option
                .setName('text')
                .setDescription('The text to paste')
                .setRequired(true)
        ),

    async run(interaction) {
        try {
            const text = interaction.options.getString('text');

            if (!text || text.length === 0) {
                return interaction.reply({ content: '❌ Please provide some text.', ephemeral: true });
            }

            await interaction.reply({ content: '⏳ Uploading your paste...', fetchReply: true });

            const response = await fetch('https://paste.rs', {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: text
            });

            if (!response.ok) {
                throw new Error(`Upload failed with status ${response.status}`);
            }

            const pasteUrl = (await response.text()).trim();

            const embed = new EmbedBuilder()
                .setTitle('Paste Uploaded')
                .setColor(getColor('secondary'))
                .addFields(
                    { name: 'Paste URL', value: pasteUrl }
                )
                .setFooter({ text: `Requested by ${interaction.user.username}` })
                .setTimestamp();

            await interaction.editReply({ content: '', embeds: [embed] });

        } catch (err) {
            console.error(err);
            await interaction.editReply('❌ Something went wrong while uploading the paste.');
        }
    }
};