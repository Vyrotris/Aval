const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { OpenAI } = require('openai');
const { getColor } = require('../../misc/colorUtil');

const fs = require('fs');
const path = require('path');
const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/config.json'), 'utf8'));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ask')
        .setDescription('Ask the AI a question')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('The question to ask the AI')
                .setRequired(true))
        .setIntegrationTypes([1])
        .setContexts([1, 2]),

    async run(interaction) {
        try {
            await interaction.deferReply();

            const question = interaction.options.getString('question');
            const apiKey = process.env.OPENAI_API_KEY;
            if (!apiKey) {
                await interaction.editReply('❌ API key is missing. Please configure it in your .env file.');
                return;
            }

            const client = new OpenAI({
                apiKey: apiKey,
            });

            const response = await client.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: config.ai_prompt
                    },
                    {
                        role: "user",
                        content: question
                    }
                ]
            });

            const answer = response.choices[0].message.content.trim();

            const embed = new EmbedBuilder()
                .setTitle(question)
                .setDescription(answer)
                .setColor(getColor('info'))
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            await interaction.editReply('❌ Something went wrong while asking the AI.');
        }
    }
};