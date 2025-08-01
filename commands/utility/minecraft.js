const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getColor } = require('../../misc/colorUtil');
const { NameMC } = require('namemcwrapper');
const nameMc = new NameMC();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('minecraft')
        .setDescription('Lookup a Minecraft player or server using NameMC')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Lookup type')
                .setRequired(true)
                .addChoices(
                    { name: 'Player', value: 'player' },
                    { name: 'Server', value: 'server' },
                )
        )
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Minecraft username or server address')
                .setRequired(true)
        )
        .setIntegrationTypes([1])
        .setContexts([1, 2]),

    async run(interaction) {
        const type = interaction.options.getString('type');
        const query = interaction.options.getString('query');

        await interaction.deferReply();

        try {
            if (type === 'player') {
                const skins = await nameMc.skinHistory({ nickname: query });
                if (!skins || skins.length === 0) {
                    return interaction.editReply({ content: `Player \`${query}\` not found on NameMC.` });
                }

                const latest = skins[0];
                const embed = new EmbedBuilder()
                    .setTitle(`Player: ${query}`)
                    .setThumbnail(`https://crafatar.com/renders/body/${latest.uuid}?size=128`)
                    .addFields(
                        { name: 'UUID', value: `\`${latest.uuid}\``, inline: false },
                        { name: 'Recent Names', value: skins.slice(0, 5).map(s => s.name).join(', ') || '—', inline: false }
                    )
                    .setColor(getColor('info'));

                return interaction.editReply({ embeds: [embed] });
            }

        if (type === 'server') {
            try {
                const serverLikes = await nameMc.api.serverLikes(query);
                const statusRes = await fetch(`https://api.mcsrvstat.us/2/${encodeURIComponent(query)}`);
                const status = await statusRes.json();

                const embed = new EmbedBuilder()
                    .setTitle(`Server: ${query}`)
                    .addFields(
                        { name: 'Likes', value: `${serverLikes.total}`, inline: true },
                        { name: 'Online Players', value: status.online ? `${status.players.online}/${status.players.max}` : 'Offline', inline: true },
                        { name: 'Version', value: status.online ? status.version : '—', inline: true },
                        { name: 'Profile', value: `[View on NameMC](https://namemc.com/server/${encodeURIComponent(query)})`, inline: false }
                    )
                    .setColor(getColor('info'));

                return interaction.editReply({ embeds: [embed] });
            } catch (err) {
                console.error(err);
                return interaction.editReply({ content: `Could not fetch server info for \`${query}\`.` });
            }
        }
        } catch (err) {
            console.error(err);
            return interaction.editReply({ content: 'Something went wrong while fetching data from NameMC.' });
        }
    }
};
