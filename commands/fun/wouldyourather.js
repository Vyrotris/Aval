const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('wouldyourather')
    .setDescription('Play Would You Rather with everyone!')
    .setIntegrationTypes([1])
    .setContexts([0, 1, 2]),

  async run(interaction) {
    await interaction.deferReply();

    const filePath = path.join(__dirname, '../../data/wyr_questions.json');
    let questions = [];

    try {
      questions = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (err) {
      console.error('❌ Failed to load WYR questions:', err);
      return interaction.editReply('⚠️ Could not load Would You Rather questions.');
    }

    const [opt1, opt2] = questions[Math.floor(Math.random() * questions.length)];

    const embed = new EmbedBuilder()
      .setTitle('🤔 Would You Rather')
      .setDescription(`**1:** ${opt1}\n**2:** ${opt2}`)
      .setFooter({ text: `Requested by ${interaction.user.username}` })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('wyr_optionOne')
        .setLabel('Option 1')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('wyr_optionTwo')
        .setLabel('Option 2')
        .setStyle(ButtonStyle.Danger)
    );

    const message = await interaction.editReply({ embeds: [embed], components: [row] });

    const votes = {
      optionOne: new Set(),
      optionTwo: new Set(),
    };

    const filter = i => ['wyr_optionOne', 'wyr_optionTwo'].includes(i.customId);

    const collector = message.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async i => {
      votes.optionOne.delete(i.user.id);
      votes.optionTwo.delete(i.user.id);

      if (i.customId === 'wyr_optionOne') votes.optionOne.add(i.user.id);
      else votes.optionTwo.add(i.user.id);

      await i.reply({
        content: `Your vote for **${i.customId === 'wyr_optionOne' ? 'Option 1' : 'Option 2'}** has been recorded.\n\nPlease wait for the round to end to see the results.`,
        ephemeral: true,
      });
    });

    collector.on('end', async collected => {
      const disabledRow = new ActionRowBuilder().addComponents(
        row.components.map(button => button.setDisabled(true))
      );

      await interaction.editReply({ components: [disabledRow] });

      const count1 = votes.optionOne.size;
      const count2 = votes.optionTwo.size;

      if (count1 + count2 === 0) {
        return interaction.followUp({
          content: 'No votes were cast. Maybe next time!',
          ephemeral: true,
        });
      }

      const resultEmbed = new EmbedBuilder()
        .setTitle('📊 Would You Rather Results')
        .addFields(
          { name: 'Option 1', value: `${opt1}\n**Votes:** ${count1}`, inline: false },
          { name: 'Option 2', value: `${opt2}\n**Votes:** ${count2}`, inline: false }
        )
        .setFooter({ text: 'Thanks for playing!' })
        .setTimestamp();

      await interaction.followUp({ embeds: [resultEmbed] });
    });
  },
};