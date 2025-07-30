const { SlashCommandBuilder, EmbedBuilder, User } = require('discord.js');
const { getColor } = require('../../misc/colorUtil');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('Look up info about a user')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user to look up')
                .setRequired(true)
        )
        .setIntegrationTypes([1])
        .setContexts([1, 2]),

    async run(interaction) {
        try {
            await interaction.deferReply();
            const user = interaction.options.getUser('target');
            let member;
            try {
                member = await interaction.guild?.members.fetch(user.id);
            } catch {
                member = null;
            }
            const embed = new EmbedBuilder()
                .setTitle(user.username)
                .setThumbnail(user.displayAvatarURL())
                .setColor(getColor('info'))
                .addFields(
                    { name: 'Display Name', value: user.displayName, inline: true },
                    { name: 'Account Created', value: user.createdAt.toLocaleString(), inline: false },
                )
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        } catch (err) {
            console.error(err);
            await interaction.editReply('❌ Something went wrong while looking up the user.');
        }
    }
};
