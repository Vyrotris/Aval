const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY;
const VIRUSTOTAL_API_URL = 'https://www.virustotal.com/api/v3/files';

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
      const response = await fetch(file.url);
      if (!response.ok) throw new Error('Failed to download file');

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const vtResponse = await fetch(VIRUSTOTAL_API_URL, {
        method: 'POST',
        headers: {
          'x-apikey': VIRUSTOTAL_API_KEY,
          'Content-Type': 'application/octet-stream',
        },
        body: buffer,
      });

      if (!vtResponse.ok) {
        const text = await vtResponse.text();
        throw new Error(`VirusTotal API error: ${text}`);
      }

      const vtData = await vtResponse.json();
      const analysisId = vtData.data.id;

      let analysis;
      const analysisUrl = `https://www.virustotal.com/api/v3/analyses/${analysisId}`;
      for (let i = 0; i < 10; i++) {
        const analysisResp = await fetch(analysisUrl, {
          headers: { 'x-apikey': VIRUSTOTAL_API_KEY },
        });
        const analysisJson = await analysisResp.json();

        if (analysisJson.data.attributes.status === 'completed') {
          analysis = analysisJson.data.attributes.results;
          break;
        }
        await new Promise(r => setTimeout(r, 3000));
      }

      if (!analysis) {
        return interaction.editReply('Scan timed out. Please try again later.');
      }

      const positives = Object.values(analysis).filter(v => v.category === 'malicious').length;
      const total = Object.keys(analysis).length;

      const embed = new EmbedBuilder()
        .setTitle('VirusTotal Scan Result')
        .setDescription(`Scanned **${file.name}** (${(file.size / 1024).toFixed(2)} KB)`)
        .addFields(
          { name: 'Malicious detections', value: `${positives} / ${total}`, inline: true },
          { name: 'Scan Link', value: `[View on VirusTotal](https://www.virustotal.com/gui/file/${vtData.data.id}/detection)`, inline: true }
        )
        .setColor(positives > 0 ? 0xFF0000 : 0x00FF00)
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error(error);
      return interaction.editReply({ content: `❌ Error scanning file: ${error.message}` });
    }
  }
};
