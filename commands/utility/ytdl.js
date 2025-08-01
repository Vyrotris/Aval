const { SlashCommandBuilder } = require('discord.js');
const { YtDlp } = require('ytdlp-nodejs');
const path = require('path');
const fs = require('fs');
const os = require('os');

const ytdlp = new YtDlp();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ytdl')
        .setDescription('Download a YouTube video')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('The YouTube video URL')
                .setRequired(true)
        )
        .setIntegrationTypes([1])
        .setContexts([1, 2]),

    async run(interaction) {
        const url = interaction.options.getString('url');
        await interaction.deferReply();

        try {
            const outputPath = path.join(os.tmpdir(), `ytdl-${Date.now()}.mp4`);

            await ytdlp.downloadAsync(url, {
                output: outputPath,
                onProgress: (progress) => {
                    console.log(progress);
                },
            });

            await interaction.editReply({
                content: 'Download complete!',
                files: [outputPath]
            });

            try {
                fs.unlinkSync(outputPath);
            } catch (err) {
                console.error('Failed to delete temp file:', err);
            }

        } catch (error) {
            console.error(error);
            await interaction.editReply('Failed to download video.');
        }
    }
};