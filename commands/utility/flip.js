const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getColor } = require('../../misc/colorUtil');

const flipTable = {
  'a': 'ɐ', 'b': 'q', 'c': 'ɔ', 'd': 'p', 'e': 'ǝ', 'f': 'ɟ', 'g': 'ƃ', 'h': 'ɥ',
  'i': 'ᴉ', 'j': 'ɾ', 'k': 'ʞ', 'l': 'ʃ', 'm': 'ɯ', 'n': 'u', 'o': 'o', 'p': 'd',
  'q': 'b', 'r': 'ɹ', 's': 's', 't': 'ʇ', 'u': 'n', 'v': 'ʌ', 'w': 'ʍ', 'x': 'x',
  'y': 'ʎ', 'z': 'z',
  'A': '∀', 'B': '𐐒', 'C': 'Ɔ', 'D': '◖', 'E': 'Ǝ', 'F': 'Ⅎ', 'G': 'פ', 'H': 'H',
  'I': 'I', 'J': 'ſ', 'K': 'ʞ', 'L': '⅂', 'M': 'W', 'N': 'N', 'O': 'O', 'P': 'Ԁ',
  'Q': 'Q', 'R': 'ɹ', 'S': 'S', 'T': '⊥', 'U': '∩', 'V': 'Λ', 'W': 'M', 'X': 'X',
  'Y': '⅄', 'Z': 'Z',
  '0': '0', '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ', '4': 'ㄣ', '5': 'ϛ', '6': '9', '7': 'ㄥ',
  '8': '8', '9': '6',
  '.': '˙', ',': "'", "'": ',', '"': ',,', '`': ',', '?': '¿', '!': '¡',
  '[': ']', ']': '[', '(': ')', ')': '(', '{': '}', '}': '{', '<': '>', '>': '<',
  '&': '⅋', '_': '‾', '^': 'v', '%': '％', '#': '＃', '*': '∗', '+': '+', '=': '=',
  '-': '-', ':': ':', ';': '؛', ' ': ' '
};

function flipText(text) {
  return text
    .split('')
    .map(c => flipTable[c] || flipTable[c.toLowerCase()] || c)
    .reverse()
    .join('');
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('flip')
    .setDescription('Flip your text upside down')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('The text to flip')
        .setRequired(true))
    .setIntegrationTypes([1])
    .setContexts([0, 1, 2]),

  async run(interaction) {
    const inputText = interaction.options.getString('text');

    if (inputText.length > 50) {
      return interaction.reply({ content: 'Text is too long. Please use 50 characters or less.', ephemeral: true });
    }

    const flipped = flipText(inputText);

    const embed = new EmbedBuilder()
      .setTitle('Flipped Text')
      .setDescription(flipped)
      .setColor(getColor('primary'))
      .setFooter({ text: `Requested by ${interaction.user.username}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};