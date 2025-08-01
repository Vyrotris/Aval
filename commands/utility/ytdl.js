const { SlashCommandBuilder } = require('discord.js');
const { YtDlp } = require('ytdlp-nodejs');
const path = require('path');
const fs = require('fs');
const os = require('os');
const axios = require('axios');
const FormData = require('form-data');

const ytdlp = new YtDlp();

async function uploadTo0x0st(filePath) {
    const fileName = path.basename(filePath);
    const fileStream = fs.createReadStream(filePath);

    const form = new FormData();
    form.append('file', fileStream, fileName);

    const res = await axios.post('https://0x0.st', form, {
        headers: form.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity
    });

    return res.data.trim();
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ytdl')
        .setDescription('Download a YouTube video and upload to 0x0.st')
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

            await interaction.editReply('📤 Uploading to 0x0.st...');
            const link = await uploadTo0x0st(outputPath);

            await interaction.editReply(`✅ Uploaded to 0x0.st: ${link}`);

            try {
                fs.unlinkSync(outputPath);
            } catch (err) {
                console.error('Failed to delete temp file:', err);
            }

        } catch (error) {
            console.error(error);
            await interaction.editReply('❌ Failed to download or upload video.');
        }
    }
};