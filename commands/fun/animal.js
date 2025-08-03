const { SlashCommandBuilder } = require('discord.js');

const SOME_RANDOM_API_BASE = 'https://api.some-random-api.com/animal';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('animal')
        .setDescription('Get a random animal image')
        .addStringOption(option =>
            option
                .setName('type')
                .setDescription('Type of animal')
                .setRequired(true)
                .addChoices(
                    { name: 'Dog', value: 'dog' },
                    { name: 'Cat', value: 'cat' },
                    { name: 'Fox', value: 'fox' },
                    { name: 'Panda', value: 'panda' },
                    { name: 'Koala', value: 'koala' },
                    { name: 'Bird', value: 'bird' }
                )
        )
        .setIntegrationTypes([1])
        .setContexts([0, 1, 2]),

    async run(interaction) {
        const type = interaction.options.getString('type');

        try {
            await interaction.deferReply();

            let imageUrl;

            if (type === 'dog') {
                const res = await fetch('https://dog.ceo/api/breeds/image/random');
                if (!res.ok) return interaction.editReply('Failed to fetch dog image.');
                const data = await res.json();
                imageUrl = data.message;

            } else if (type === 'cat') {
                const res = await fetch('https://api.thecatapi.com/v1/images/search?limit=1');
                if (!res.ok) return interaction.editReply('Failed to fetch cat image.');
                const data = await res.json();
                imageUrl = data[0].url;

            } else {
                const res = await fetch(`${SOME_RANDOM_API_BASE}/${type}`);
                if (!res.ok) return interaction.editReply(`Failed to fetch ${type} image.`);
                const data = await res.json();
                imageUrl = data.image
            }

            await interaction.editReply(imageUrl);

        } catch (error) {
            console.error(error);
            await interaction.editReply(`Something went wrong fetching the ${type} image.`);
        }
    }
};