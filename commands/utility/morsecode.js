const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getColor } = require('../../misc/colorUtil');

const morseCodeMap = {
    A: '.-',    B: '-...',  C: '-.-.',  D: '-..',   E: '.',
    F: '..-.',  G: '--.',   H: '....',  I: '..',    J: '.---',
    K: '-.-',   L: '.-..',  M: '--',    N: '-.',    O: '---',
    P: '.--.',  Q: '--.-',  R: '.-.',   S: '...',   T: '-',
    U: '..-',   V: '...-',  W: '.--',   X: '-..-',  Y: '-.--',
    Z: '--..',
    0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-',
    5: '.....', 6: '-....', 7: '--...', 8: '---..', 9: '----.',
    ' ': '/',
};

const reverseMorseMap = Object.fromEntries(
    Object.entries(morseCodeMap).map(([letter, code]) => [code, letter])
);

function encodeToMorse(text) {
    return text
        .toUpperCase()
        .split('')
        .map(char => morseCodeMap[char] || '')
        .join(' ');
}

function decodeFromMorse(morse) {
    return morse
        .split(' ')
        .map(code => reverseMorseMap[code] || '')
        .join('');
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('morsecode')
        .setDescription('Encode or decode Morse code')
        .addStringOption(option =>
            option.setName('mode')
                .setDescription('Choose whether to encode or decode')
                .setRequired(true)
                .addChoices(
                    { name: 'Encode', value: 'encode' },
                    { name: 'Decode', value: 'decode' }
                )
        )
        .addStringOption(option =>
            option.setName('text')
                .setDescription('The text or Morse code to process')
                .setRequired(true)
        )
        .setIntegrationTypes([1])
        .setContexts([1, 2]),

    async run(interaction) {
        try {
            const mode = interaction.options.getString('mode');
            const inputText = interaction.options.getString('text');

            let result;
            if (mode === 'encode') {
                result = encodeToMorse(inputText);
            } else {
                result = decodeFromMorse(inputText);
            }

            if (!result) {
                return interaction.reply({ content: '❌ Could not process your request.', ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle(`Morse Code - ${mode.charAt(0).toUpperCase() + mode.slice(1)}`)
                .setColor(getColor('primary'))
                .addFields(
                    { name: 'Input', value: `\`\`\`${inputText}\`\`\`` },
                    { name: 'Output', value: `\`\`\`${result}\`\`\`` }
                )
                .setFooter({ text: `Requested by ${interaction.user.username}` })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            await interaction.reply({ content: '❌ Something went wrong while processing Morse code.', ephemeral: true });
        }
    }
};
