const { SlashCommandBuilder } = require('discord.js');
const { YtDlp } = require('ytdlp-nodejs');
const path = require('path');
const fs = require('fs');
const os = require('os');
const axios = require('axios');

const ytdlp = new YtDlp();

async function uploadToTransferSh(filePath) {
    const fileName = path.basename(filePath);
    const fileStream = fs.createReadStream(filePath);

    const res = await axios.put(`https://transfer.sh/${fileName}`, fileStream, {
        headers: {
            'Content-Type': 'application/octet-stream'
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
    });

    return res.data.trim();
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ytdl')
        .setDescription('Download a YouTube video and upload to transfer.sh')
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

            await interaction.editReply('📤 Uploading to transfer.sh...');
            const link = await uploadToTransferSh(outputPath);

            await interaction.editReply(`✅ Uploaded to transfer.sh: ${link}`);

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