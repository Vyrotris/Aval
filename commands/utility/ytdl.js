const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const ytdl = require('ytdl-core');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ytdl')
    .setDescription('Download a YouTube video')
    .addStringOption(option =>
      option.setName('url')
        .setDescription('YouTube video URL')
        .setRequired(true)
    )
    .setIntegrationTypes([1])
    .setContexts([1, 2]),

  async run(interaction) {
    const url = interaction.options.getString('url');

    if (!ytdl.validateURL(url)) {
      return interaction.reply({ content: '❌ Invalid YouTube URL.', ephemeral: true });
    }

    await interaction.reply({ content: '📥 Downloading video, please wait...' });

    try {
      const info = await ytdl.getInfo(url);
      const title = info.videoDetails.title.replace(/[<>:"/\\|?*]/g, '');
      const filePath = path.join(__dirname, '../../data', `${title}.mp4`);

      const videoStream = ytdl(url, { quality: 'highest' });
      const fileStream = fs.createWriteStream(filePath);
      videoStream.pipe(fileStream);

      fileStream.on('finish', async () => {
        try {
            await interaction.followUp({
                content: `✅ Download complete: **${title}**`,
                files: [filePath]
            });

          fs.unlinkSync(filePath);
        } catch (err) {
          console.error(err);
          await interaction.followUp('❌ Failed to send the video.');
        }
      });

    } catch (error) {
      console.error(error);
      await interaction.followUp('❌ Failed to download the video.');
    }
  }
};