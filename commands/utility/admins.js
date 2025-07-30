const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getColor } = require('../../misc/colorUtil');

const allowedIDs = process.env.ADMINS ? process.env.ADMINS.split(',').map(id => id.trim()) : [];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('admins')
        .setDescription('Displays the current admins for this bot')
        .setIntegrationTypes([1])
        .setContexts([1, 2]),

    async run(interaction) {
        try {
            await interaction.deferReply();
            if (!allowedIDs.length) {
                await interaction.editReply('No admins are configured.');
                return;
            }
            const members = await Promise.all(
                allowedIDs.map(async id => {
                    try {
                        const user = await interaction.client.users.fetch(id);
                        return user;
                    } catch (e) {
                        console.error(`Failed to fetch admin ID: ${id}`, e);
                        return null;
                    }
                })
            );
            const filtered = members.filter(Boolean);
            if (!filtered.length) {
                await interaction.editReply('No valid admin users found.');
                return;
            }
            const embed = new EmbedBuilder()
                .setTitle('Admins')
                .setColor(getColor('info'))
                .setTimestamp();
            filtered.forEach(user => {
                embed.addFields({
                    name: `${user.username}`,
                    value: `\n**Joined:** ${user.createdAt.toLocaleDateString()}\n**Avatar:** [View](${user.displayAvatarURL({ dynamic: true, size: 256 })})`,
                    inline: true
                });
            });
            await interaction.editReply({ embeds: [embed] });
        } catch (err) {
            console.error(err);
            await interaction.editReply('❌ Something went wrong while fetching admins.');
        }
    }
};