const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getColor } = require('../../misc/colorUtil');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('qrcode')
        .setDescription('Generate a QR code for a URL or text')
        .setIntegrationTypes([1])
        .setContexts([1, 2])
        .addStringOption(option =>
            option
                .setName('text')
                .setDescription('The text or URL to encode into a QR code')
                .setRequired(true)
        ),

    async run(interaction) {
        try {
            const text = interaction.options.getString('text');

            if (text.startsWith('http://') || text.startsWith('https://')) {
                try {
                    new URL(text);
                } catch {
                    return interaction.reply({ content: '❌ Please provide a valid URL.', ephemeral: true });
                }
            }

            await interaction.reply({ content: '⏳ Generating QR code...', fetchReply: true });

            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(text)}`;

            const embed = new EmbedBuilder()
                .setTitle('QR Code Generated')
                .setColor(getColor('secondary'))
                .setDescription('Here is your QR code:')
                .addFields(
                    { name: 'Content', value: text }
                )
                .setImage(qrUrl)
                .setFooter({ text: `Requested by ${interaction.user.username}` })
                .setTimestamp();

            await interaction.editReply({ content: '', embeds: [embed] });

        } catch (err) {
            console.error(err);
            await interaction.editReply('❌ Something went wrong while generating the QR code.');
        }
    }
};