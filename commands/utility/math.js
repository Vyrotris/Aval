const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getColor } = require('../../misc/colorUtil');
const { evaluate } = require('mathjs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('math')
        .setDescription('Evaluate a math expression')
        .addStringOption(option =>
            option.setName('expression')
                .setDescription('The math expression to evaluate')
                .setRequired(true))
        .setIntegrationTypes([1])
        .setContexts([1, 2]),

    async run(interaction) {
        try {
            const expr = interaction.options.getString('expression');
            let result;
            try {
                result = evaluate(expr);
            } catch (error) {
                return await interaction.reply({ content: 'Invalid math expression.', ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle('Math Evaluation Result')
                .addFields(
                    { name: 'Expression', value: `\`${expr}\`` },
                    { name: 'Result', value: `\`${result}\`` }
                )
                .setColor(getColor('info'))
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: false });

        } catch (err) {
            console.error(err);
            await interaction.reply({ content: 'Something went wrong while evaluating the expression.', ephemeral: true });
        }
    }
};