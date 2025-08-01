const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const virustotal = require('@api/virustotal');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('scan')
    .setDescription('Scan a file for viruses')
    .addAttachmentOption(option =>
      option.setName('file')
        .setDescription('File to scan')
        .setRequired(true)
    )
    .setIntegrationTypes([1])
    .setContexts([1, 2]),

  async run(interaction) {
    const file = interaction.options.getAttachment('file');

    if (!file) {
      return interaction.reply({ content: 'Please upload a file to scan.', ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      const { data } = await virustotal.postFiles({'x-apikey': process.env.VIRUSTOTAL_API_KEY}, {
        file: file.attachment,
      });

      const positives = data.attributes.last_analysis_stats.malicious || 0;
      const total = Object.values(data.attributes.last_analysis_stats).reduce((a, b) => a + b, 0);

      const embed = new EmbedBuilder()
        .setTitle('VirusTotal Scan Result')
        .setDescription(`Scanned **${file.name}** (${(file.size / 1024).toFixed(2)} KB)`)
        .addFields(
          { name: 'Malicious detections', value: `${positives} / ${total}`, inline: true },
          { name: 'Scan Link', value: `[View on VirusTotal](https://www.virustotal.com/gui/file/${data.id}/detection)`, inline: true }
        )
        .setColor(positives > 0 ? 0xFF0000 : 0x00FF00)
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error(error);
      await interaction.editReply({ content: `❌ Error scanning file: ${error.message}` });
    }
  }
};