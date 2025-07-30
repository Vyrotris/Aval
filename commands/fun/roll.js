const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getColor } = require('../../misc/colorUtil');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Roll a dice with specified number of sides')
        .addIntegerOption(option =>
            option.setName('sides')
                .setDescription('Number of sides on the dice (default 6)')
                .setMinValue(2)
                .setMaxValue(1000)
                .setRequired(false)
        )
        .setIntegrationTypes([1])
        .setContexts([1, 2]),

    async run(interaction) {
        try {
            const sides = interaction.options.getInteger('sides') ?? 6;
            const roll = Math.floor(Math.random() * sides) + 1;

            const embed = new EmbedBuilder()
                .setTitle('🎲 Dice Roll')
                .setDescription(`You rolled a **${roll}** on a **${sides}-sided** dice!`)
                .setColor(getColor('primary'))
                .setFooter({ text: `Requested by ${interaction.user.username}` })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (err) {
            console.error(err);
            await interaction.reply('❌ Something went wrong while rolling the dice.');
        }
    }
};