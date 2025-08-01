const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const FormData = require('form-data');

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
      // Download file
      const fileResp = await axios.get(file.url, { responseType: 'arraybuffer' });
      const fileBuffer = Buffer.from(fileResp.data);

      // Prepare form data
      const form = new FormData();
      form.append('file', fileBuffer, file.name);

      // Upload to VirusTotal
      const vtResponse = await axios.post('https://www.virustotal.com/api/v3/files', form, {
        headers: {
          'x-apikey': process.env.VIRUSTOTAL_API_KEY,
          ...form.getHeaders(),
        }
      });

      const analysisId = vtResponse.data.data.id;

      // Send link immediately so Discord doesn't timeout
      await interaction.editReply({
        content: `✅ Scan started! You can monitor the progress here:\nhttps://www.virustotal.com/gui/file/${analysisId}/detection`
      });

      // Background polling for result
      let analysisData = null;
      const analysisUrl = `https://www.virustotal.com/api/v3/analyses/${analysisId}`;

      for (let i = 0; i < 10; i++) {
        const res = await axios.get(analysisUrl, {
          headers: { 'x-apikey': process.env.VIRUSTOTAL_API_KEY }
        });
        if (res.data.data.attributes.status === 'completed') {
          analysisData = res.data.data.attributes.results;
          break;
        }
        await new Promise(r => setTimeout(r, 3000));
      }

      if (!analysisData) {
        return interaction.followUp({ content: '⚠️ Scan timed out before completion.', ephemeral: true });
      }

      // Count detections
      const positives = Object.values(analysisData).filter(v => v.category === 'malicious').length;
      const total = Object.keys(analysisData).length;

      // Build result embed
      const embed = new EmbedBuilder()
        .setTitle('VirusTotal Scan Result')
        .setDescription(`Scanned **${file.name}** (${(file.size / 1024).toFixed(2)} KB)`)
        .addFields(
          { name: 'Malicious detections', value: `${positives} / ${total}`, inline: true },
          { name: 'Scan Link', value: `[View on VirusTotal](https://www.virustotal.com/gui/file/${analysisId}/detection)`, inline: true }
        )
        .setColor(positives > 0 ? 0xFF0000 : 0x00FF00)
        .setTimestamp();

      // Send results when ready
      await interaction.followUp({ embeds: [embed], ephemeral: true });

    } catch (error) {
      console.error('VirusTotal scan error:', error);
      await interaction.editReply({ content: `❌ Error scanning file: ${error.message}` });
    }
  }
};