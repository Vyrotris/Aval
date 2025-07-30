const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('insult')
        .setDescription('Send a random insult to someone')
        .addUserOption(option =>
            option
                .setName('target')
                .setDescription('The person you want to insult')
                .setRequired(true)
        )
        .setIntegrationTypes([1])
        .setContexts([0, 1, 2]),

    async run(interaction) {
        try {
            await interaction.deferReply();

            const target = interaction.options.getUser('target');

            const res = await fetch('https://evilinsult.com/generate_insult.php?lang=en&type=json');
            if (!res.ok) {
                return interaction.editReply('Failed to fetch insult.');
            }

            let { insult } = await res.json();

            if (!/^(i'm|i am|i'd}|i)/i.test(insult)) {
                insult = insult.charAt(0).toLowerCase() + insult.slice(1);
            }

            await interaction.editReply(`${target}, ${insult}`);

        } catch (error) {
            console.error(error);
            await interaction.editReply('Something went wrong fetching the insult.');
        }
    }
};