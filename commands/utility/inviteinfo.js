const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getColor } = require('../../misc/colorUtil');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inviteinfo')
        .setDescription('Look up info about a Discord invite code')
        .addStringOption(option =>
            option.setName('code')
                .setDescription('The invite code or full invite link')
                .setRequired(true)
        )
        .setIntegrationTypes([1])
        .setContexts([1, 2]),

    async run(interaction) {
        try {
            await interaction.deferReply();

            let code = interaction.options.getString('code').trim();
            code = code.replace(/https?:\/\/(www\.)?discord\.gg\//, '');

            let invite;
            try {
                invite = await interaction.client.fetchInvite(code, {
                    with_counts: true,
                    with_expiration: true
                });
            } catch {
                return interaction.editReply('❌ Invalid or expired invite code.');
            }

            const guild = invite.guild;
            const inviter = invite.inviter;

            const embed = new EmbedBuilder()
                .setTitle(`Invite Info for ${guild?.name || 'Unknown Server'}`)
                .setColor(getColor('info'))
                .addFields(
                    { name: 'Code', value: invite.code, inline: true },
                    { name: 'Server Name', value: guild?.name || 'Unknown', inline: true },
                    { name: 'Server ID', value: guild?.id || 'Unknown', inline: false },
                    { name: 'Members', value: invite.memberCount.toString() || 'N/A', inline: true },
                    { name: 'Online', value: invite.presenceCount.toString() || 'N/A', inline: true },
                    { name: 'Inviter', value: inviter ? `${inviter.tag} (${inviter.id})` : 'Unknown', inline: false },
                    { 
                        name: 'Expires At', value: invite.expiresAt 
                            ? `<t:${Math.floor(invite.expiresAt.getTime() / 1000)}:F> (${`<t:${Math.floor(invite.expiresAt.getTime() / 1000)}:R>`})` 
                            : 'Never', inline: false 
                    }
                )
                .setTimestamp();

            if (guild?.icon) {
                embed.setThumbnail(`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`);
            }

            await interaction.editReply({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            await interaction.editReply('Something went wrong while fetching invite info.');
        }
    }
};