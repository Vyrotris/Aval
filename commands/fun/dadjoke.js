const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { getColor } = require('../../misc/colorUtil');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dadjoke')
        .setDescription('Get a random dad joke')
        .setIntegrationTypes([1])
        .setContexts([1, 2]),

    async run(interaction) {
        try {
            await interaction.deferReply();

            const res = await fetch('https://icanhazdadjoke.com/', {
                headers: { 'Accept': 'application/json' }
            });
            if (!res.ok) {
                return await interaction.editReply('❌ Failed to fetch dad joke.');
            }

            const data = await res.json();
            const jokeText = data.joke;

            const embed = new EmbedBuilder()
                .setTitle('😂 Here’s a Dad Joke for You!')
                .setDescription(jokeText)
                .setColor(getColor('secondary'))
                .setFooter({ text: `Requested by ${interaction.user.username}` })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            await interaction.editReply('❌ Something went wrong while fetching the dad joke.');
        }
    }
};