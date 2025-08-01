const { SlashCommandBuilder } = require('discord.js');
const { YtDlp } = require('ytdlp-nodejs');
const path = require('path');
const fs = require('fs');
const os = require('os');
const FormData = require('form-data');
const axios = require('axios');

const ytdlp = new YtDlp();

async function uploadToCatbox(filePath) {
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', fs.createReadStream(filePath));

    const res = await axios.post('https://catbox.moe/user/api.php', form, {
        headers: form.getHeaders()
    });

    return res.data;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ytdl')
        .setDescription('Download a YouTube video and upload to Catbox.moe')
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

            await interaction.editReply('Downloading...');
            const link = await uploadToCatbox(outputPath);

            await interaction.editReply(`Downloaded: ${link}`);

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