const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getColor } = require('../../misc/colorUtil');
const { translate } = require('google-translate-api-x');

function capitalize(str) {
  if (!str) return '';
  return str.toUpperCase();
}

const languages = {
  english: 'en',
  spanish: 'es',
  french: 'fr',
  german: 'de',
  italian: 'it',
  portuguese: 'pt',
  russian: 'ru',
  chinese: 'zh-CN',
  japanese: 'ja',
  korean: 'ko',
  arabic: 'ar',
  hindi: 'hi'
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('translate')
    .setDescription('Translate text to a specified language')
    .setIntegrationTypes([1])
    .setContexts([0, 1, 2])
    .addStringOption(option =>
      option.setName('text').setDescription('Text to translate').setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('target')
        .setDescription('Target language code or full name (e.g. en, spanish)')
        .setRequired(true)
    ),

  async run(interaction) {
    try {
      await interaction.deferReply();

      const text = interaction.options.getString('text');
      let target = interaction.options.getString('target').toLowerCase();

      if (languages[target]) target = languages[target];

      if (!/^[a-z\-]{2,5}$/.test(target)) {
        return interaction.editReply('❌ Please provide a valid target language code or full language name.');
      }

      const res = await translate(text, { to: target });

      const embed = new EmbedBuilder()
        .setTitle('Translation')
        .setColor(getColor('info'))
        .addFields(
          { name: 'Original', value: text.length > 1024 ? text.slice(0, 1021) + '...' : text },
          { name: 'Translated', value: res.text.length > 1024 ? res.text.slice(0, 1021) + '...' : res.text }
        )
        .setFooter({ text: `From ${capitalize(res.from.language.iso)} to ${capitalize(target)}` })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error('Translate command error:', err);
      await interaction.editReply(`❌ Something went wrong: ${err.message}`);
    }
  }
};