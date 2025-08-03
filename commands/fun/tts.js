const { SlashCommandBuilder } = require('discord.js');
const googleTTS = require('google-tts-api');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function getRandomFileName(ext) {
  const randomStr = crypto.randomBytes(6).toString('hex');
  const timestamp = Date.now();
  return `${randomStr}_${timestamp}.${ext}`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tts')
    .setDescription('Convert text to speech and send an MP3 file')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('Text to convert to speech')
        .setRequired(true))
    .setIntegrationTypes([1])
    .setContexts([0, 1, 2]),
    
  async run(interaction) {
    await interaction.deferReply();

    const text = interaction.options.getString('text').slice(0, 200);

    try {
      const ttsUrl = googleTTS.getAudioUrl(text, {
        lang: 'en',
        slow: false,
        host: 'https://translate.google.com',
      });

      const mp3Response = await fetch(ttsUrl);
      const mp3Buffer = Buffer.from(await mp3Response.arrayBuffer());

      const tempFolder = path.resolve(__dirname, '../../aval_temp');
      if (!fs.existsSync(tempFolder)) fs.mkdirSync(tempFolder, { recursive: true });

      const mp3Path = path.join(tempFolder, getRandomFileName('mp3'));
      fs.writeFileSync(mp3Path, mp3Buffer);

      await interaction.editReply({
        content: 'Here is your voice message (MP3):',
        files: [mp3Path],
      });

      fs.unlinkSync(mp3Path);
    } catch (err) {
      console.error(err);
      await interaction.editReply('Sorry, something went wrong generating your voice message.');
    }
  },
};