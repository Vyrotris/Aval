const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getColor } = require('../../misc/colorUtil');

function fromBinary(binaryStr) {
    try {
        return binaryStr
            .split(' ')
            .map(bin => String.fromCharCode(parseInt(bin, 2)))
            .join('');
    } catch {
        return null;
    }
}

function decodeText(type, text) {
    try {
        switch (type) {
            case 'base64':
                return Buffer.from(text, 'base64').toString('utf-8');
            case 'url':
                return decodeURIComponent(text);
            case 'hex':
                return Buffer.from(text, 'hex').toString('utf-8');
            case 'binary':
                return fromBinary(text);
            default:
                return text;
        }
    } catch {
        return null;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('decode')
        .setDescription('Decode text from base64, URL encoding, hex, or binary')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Decoding type')
                .setRequired(true)
                .addChoices(
                    { name: 'Base64', value: 'base64' },
                    { name: 'URL Encoding', value: 'url' },
                    { name: 'Hexadecimal', value: 'hex' },
                    { name: 'Binary', value: 'binary' },
                ))
        .addStringOption(option =>
            option.setName('text')
                .setDescription('Text to decode')
                .setRequired(true))
        .setIntegrationTypes([1])
        .setContexts([0, 1, 2]),

    async run(interaction) {
        const type = interaction.options.getString('type');
        const text = interaction.options.getString('text');

        const decoded = decodeText(type, text);

        if (!decoded) {
            return await interaction.reply({ content: '❌ Failed to decode text. Please make sure the input is valid for the selected encoding.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle(`Decode from ${type.toUpperCase()}`)
            .setColor(getColor('primary'))
            .addFields(
                { name: 'Encoded Text', value: text },
                { name: 'Decoded Result', value: '```' + decoded + '```' }
            )
            .setFooter({ text: `Requested by ${interaction.user.username}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};