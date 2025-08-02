const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { default: piston } = require('piston-client');
const { getColor } = require('../../misc/colorUtil');

const client = piston({ server: 'https://emkc.org' });

const languageNames = {
  javascript: 'JavaScript',
  python: 'Python',
  java: 'Java',
  c: 'C',
  cpp: 'C++',
  go: 'Go',
  lua: 'Lua'
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('eval')
    .setDescription('Run code in multiple languages')
    .addStringOption(option =>
      option.setName('language')
        .setDescription('Programming language')
        .setRequired(true)
        .addChoices(
          { name: 'JavaScript', value: 'javascript' },
          { name: 'Python', value: 'python' },
          { name: 'Java', value: 'java' },
          { name: 'C', value: 'c' },
          { name: 'C++', value: 'cpp' },
          { name: 'Go', value: 'go' },
          { name: 'Lua', value: 'lua' }
        ))
    .addStringOption(option =>
      option.setName('code')
        .setDescription('Code to execute')
        .setRequired(true))
    .setIntegrationTypes([1])
    .setContexts([1, 2]),

  async run(interaction) {
    await interaction.deferReply();

    const languageRaw = interaction.options.getString('language');
    const language = languageRaw.toLowerCase();

    const displayName = languageNames[language] || languageRaw;

    try {
      const result = await client.execute(language, interaction.options.getString('code'));

      let output = (result.run.stdout || '') + (result.run.stderr || '');
      output = output.trim() || 'No output';

      if (output.length > 1000) {
        output = output.slice(0, 1000) + '... [truncated]';
      }

      const embed = new EmbedBuilder()
        .setColor(getColor('primary'))
        .setTitle(`Eval | ${displayName}`)
        .addFields(
          { name: 'Input', value: `\`\`\`${language}\n${interaction.options.getString('code')}\`\`\`` },
          { name: 'Output', value: `\`\`\`${output}\`\`\`` }
        )
        .setFooter({ text: `Requested by ${interaction.user.username}` });

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error(error);
      await interaction.editReply('Error executing code.');
    }
  }
};