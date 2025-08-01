const { SlashCommandBuilder } = require('discord.js');
const { YtDlp } = require('ytdlp-nodejs');
const path = require('path');
const fs = require('fs');
const os = require('os');
const axios = require('axios');
const FormData = require('form-data');

const ytdlp = new YtDlp();

async function uploadToCatbox(filePath) {
    const fileName = path.basename(filePath);
    const fileStream = fs.createReadStream(filePath);

    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', fileStream, fileName);

    const res = await axios.post('https://catbox.moe/user/api.php', form, {
        headers: form.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
    });

    return res.data.trim();
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ytdl')
        .setDescription('Download a YouTube video and upload to catbox.moe')
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
            const avalTempDir = path.join(__dirname, '..', '..', 'aval_temp');

            if (!fs.existsSync(avalTempDir)) {
                fs.mkdirSync(avalTempDir, { recursive: true });
            }

            const outputPath = path.join(avalTempDir, `ytdl-${Date.now()}.mp4`);

            await ytdlp.downloadAsync(url, {
                output: outputPath,
                format: 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4',
                onProgress: (progress) => {
                    console.log(progress);
                },
            });

            const link = await uploadToCatbox(outputPath);
            await interaction.editReply(`✅ Uploaded: ${link}`);

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