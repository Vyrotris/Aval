const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getColor } = require('../../misc/colorUtil');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('joke')
        .setDescription('Get a random joke')
        .setIntegrationTypes([1])
        .setContexts([0, 1, 2]),

    async run(interaction) {
        try {
            await interaction.deferReply();

            const res = await fetch('https://v2.jokeapi.dev/joke/Any');
            const data = await res.json();

            let jokeText;
            if (data.type === 'single') {
                jokeText = data.joke;
            } else {
                jokeText = `${data.setup}\n\n||${data.delivery}||`;
            }

            const embed = new EmbedBuilder()
                .setTitle('😂 Here’s a Joke for You!')
                .setDescription(jokeText)
                .setColor(getColor('secondary'))
                .setFooter({ text: `Requested by ${interaction.user.username}` })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            await interaction.editReply('❌ Something went wrong while fetching the joke.');
        }
    }
};