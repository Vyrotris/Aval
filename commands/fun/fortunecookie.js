const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getColor } = require('../../misc/colorUtil');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fortunecookie')
    .setDescription('Receive a random fortune cookie')
    .setIntegrationTypes([1])
    .setContexts([1, 2]),

  async run(interaction) {
    await interaction.deferReply();
    try {
      const resp = await fetch('https://api.viewbits.com/v1/fortunecookie?mode=random');
      const json = await resp.json();
      const fortune = json.text || 'No fortune this time.';
      const nums = (json.numbers || '').split(',').map(n => n.trim());

      const embed = new EmbedBuilder()
        .setTitle('🥠 Fortune Cookie')
        .setDescription(fortune)
        .setColor(getColor('secondary'))
        .addFields(
          nums.length
            ? { name: 'Lucky Numbers', value: nums.join(', ') }
            : { name: 'Lucky Numbers', value: '—' }
        )
        .setTimestamp()
        .setFooter({ text: `Requested by ${interaction.user.username}` });

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply('Sorry, I couldn’t fetch your fortune. Try again shortly!');
    }
  },
};