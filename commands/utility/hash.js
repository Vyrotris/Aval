const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const crypto = require('crypto');
const { getColor } = require('../../misc/colorUtil');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hash')
        .setDescription('Generate a hash of text')
        .addStringOption(option =>
            option.setName('algorithm')
                .setDescription('Hash algorithm')
                .setRequired(true)
                .addChoices(
                    { name: 'MD5', value: 'md5' },
                    { name: 'SHA1', value: 'sha1' },
                    { name: 'SHA256', value: 'sha256' },
                    { name: 'SHA512', value: 'sha512' },
                ))
        .addStringOption(option =>
            option.setName('text')
                .setDescription('Text to hash')
                .setRequired(true))
        .setIntegrationTypes([1])
        .setContexts([0, 1, 2]),

    async run(interaction) {
        const algorithm = interaction.options.getString('algorithm');
        const text = interaction.options.getString('text');

        try {
            const hash = crypto.createHash(algorithm).update(text).digest('hex');

            const embed = new EmbedBuilder()
                .setTitle(`Hash with ${algorithm.toUpperCase()}`)
                .setColor(getColor('primary'))
                .addFields(
                    { name: 'Original Text', value: text },
                    { name: 'Hash', value: '```' + hash + '```' }
                )
                .setFooter({ text: `Requested by ${interaction.user.username}` })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (err) {
            console.error(err);
            await interaction.reply({ content: '❌ Failed to generate hash.', ephemeral: true });
        }
    }
};