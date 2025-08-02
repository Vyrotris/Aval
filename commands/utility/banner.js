const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getColor } = require('../../misc/colorUtil');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('banner')
        .setDescription('Show the banner of a user, if they have one')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user to get the banner of')
                .setRequired(false)
        )
        .setIntegrationTypes([1])
        .setContexts([1, 2]),

    async run(interaction) {
        try {
            await interaction.deferReply();

            const user = interaction.options.getUser('target') || interaction.user;
            const fetchedUser = await interaction.client.users.fetch(user.id, { force: true });

            if (!fetchedUser.banner) {
                return interaction.editReply(`${user.username} does not have a banner.`);
            }

            const bannerURL = fetchedUser.bannerURL({ size: 4096, dynamic: true });

            const embed = new EmbedBuilder()
                .setTitle(`${user.username}'s Banner`)
                .setColor(getColor('info'))
                .setImage(bannerURL)
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (err) {
            console.error(err);
            await interaction.editReply('Something went wrong while fetching the banner.');
        }
    }
};