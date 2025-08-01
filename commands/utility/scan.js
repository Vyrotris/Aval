const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

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
      // Submit the file's URL to VirusTotal for scanning
      const vtResponse = await axios.post(
        'https://www.virustotal.com/api/v3/urls',
        `url=${encodeURIComponent(file.url)}`,
        {
          headers: {
            'x-apikey': process.env.VIRUSTOTAL_API_KEY,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const analysisId = vtResponse.data.data.id;
      const analysisUrl = `https://www.virustotal.com/api/v3/analyses/${analysisId}`;

      // Wait for scan to finish
      let analysisData = null;
      for (let i = 0; i < 10; i++) {
        const res = await axios.get(analysisUrl, {
          headers: { 'x-apikey': process.env.VIRUSTOTAL_API_KEY }
        });
        if (res.data.data.attributes.status === 'completed') {
          analysisData = res.data.data.attributes.stats;
          break;
        }
        await new Promise(r => setTimeout(r, 3000));
      }

      if (!analysisData) {
        return interaction.editReply('⚠️ Scan timed out before completion.');
      }

      const positives = analysisData.malicious || 0;
      const total = Object.values(analysisData).reduce((a, b) => a + b, 0);

      const embed = new EmbedBuilder()
        .setTitle('VirusTotal Scan Result')
        .setDescription(`Scanned **${file.name}**`)
        .addFields(
          { name: 'Malicious detections', value: `${positives} / ${total}`, inline: true },
          { name: 'Scan Link', value: `[View on VirusTotal](https://www.virustotal.com/gui/url/${analysisId})`, inline: true }
        )
        .setColor(positives > 0 ? 0xFF0000 : 0x00FF00)
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('VirusTotal scan error:', error.response?.data || error.message);
      await interaction.editReply({ content: `❌ Error scanning file: ${error.message}` });
    }
  }
};