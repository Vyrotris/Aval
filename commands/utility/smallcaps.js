const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getColor } = require('../../misc/colorUtil');

const smallCapsMap = {
  a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ꜰ', g: 'ɢ', h: 'ʜ',
  i: 'ɪ', j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ', n: 'ɴ', o: 'ᴏ', p: 'ᴘ',
  q: 'ǫ', r: 'ʀ', s: 's', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x',
  y: 'ʏ', z: 'ᴢ'
};

function toSmallCaps(text) {
  return text
    .toLowerCase()
    .split('')
    .map(c => smallCapsMap[c] || c)
    .join('');
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('smallcaps')
    .setDescription('Convert text to small caps style')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('The text to convert')
        .setRequired(true))
    .setIntegrationTypes([1])
    .setContexts([0, 1, 2]),

  async run(interaction) {
    const inputText = interaction.options.getString('text');

    if (inputText.length > 50) {
      return interaction.reply({ content: 'Text is too long. Please use 50 characters or less.', ephemeral: true });
    }

    const smallcapsText = toSmallCaps(inputText);

    const embed = new EmbedBuilder()
      .setTitle('Small Caps Text')
      .setDescription(smallcapsText)
      .setColor(getColor('primary'))
      .setFooter({ text: `Requested by ${interaction.user.username}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};