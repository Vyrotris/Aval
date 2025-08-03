const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getColor } = require('../../misc/colorUtil');

function toBinary(text) {
    return text.split('')
        .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
        .join(' ');
}

function encodeText(type, text) {
    switch (type) {
        case 'base64':
            return Buffer.from(text).toString('base64');
        case 'url':
            return encodeURIComponent(text);
        case 'hex':
            return Buffer.from(text).toString('hex');
        case 'binary':
            return toBinary(text);
        default:
            return text;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('encode')
        .setDescription('Encode text to base64, URL encoding, hex, or binary')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Encoding type')
                .setRequired(true)
                .addChoices(
                    { name: 'Base64', value: 'base64' },
                    { name: 'URL Encoding', value: 'url' },
                    { name: 'Hexadecimal', value: 'hex' },
                    { name: 'Binary', value: 'binary' },
                ))
        .addStringOption(option =>
            option.setName('text')
                .setDescription('Text to encode')
                .setRequired(true))
        .setIntegrationTypes([1])
        .setContexts([0, 1, 2]),

    async run(interaction) {
        const type = interaction.options.getString('type');
        const text = interaction.options.getString('text');

        try {
            const encoded = encodeText(type, text);

            const embed = new EmbedBuilder()
                .setTitle(`Encode to ${type.toUpperCase()}`)
                .setColor(getColor('primary'))
                .addFields(
                    { name: 'Original Text', value: text },
                    { name: 'Encoded Result', value: '```' + encoded + '```' }
                )
                .setFooter({ text: `Requested by ${interaction.user.username}` })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (err) {
            console.error(err);
            await interaction.reply({ content: '❌ Failed to encode text.', ephemeral: true });
        }
    }
};