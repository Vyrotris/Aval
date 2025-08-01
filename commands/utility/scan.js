const { SlashCommandBuilder } = require('discord.js');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

const VIRUSTOTAL_API_KEY = process.env.VT_API_KEY;

async function scanFileWithVirusTotal(filePath) {
    const fileStream = fs.createReadStream(filePath);
    const form = new FormData();
    form.append('file', fileStream);

    const uploadRes = await axios.post(
        'https://www.virustotal.com/api/v3/files',
        form,
        {
            headers: {
                ...form.getHeaders(),
                'x-apikey': VIRUSTOTAL_API_KEY,
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
        }
    );

    const analysisId = uploadRes.data.data.id;

    let analysis;
    while (true) {
        const res = await axios.get(
            `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
            { headers: { 'x-apikey': VIRUSTOTAL_API_KEY } }
        );

        if (res.data.data.attributes.status === 'completed') {
            analysis = res.data.data.attributes.results;
            break;
        }

        await new Promise(r => setTimeout(r, 3000));
    }

    return analysis;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('scan')
        .setDescription('Upload a file to VirusTotal and scan it')
        .addAttachmentOption(option =>
            option.setName('file')
                .setDescription('The file to scan')
                .setRequired(true)
        )
        .setIntegrationTypes([1])
        .setContexts([1, 2]),

    async run(interaction) {
        const attachment = interaction.options.getAttachment('file');

        await interaction.deferReply();

        try {
            const tempDir = path.join(__dirname, '..', '..', 'aval_temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
            const filePath = path.join(tempDir, attachment.name);

            const fileData = await axios.get(attachment.url, { responseType: 'arraybuffer' });
            fs.writeFileSync(filePath, fileData.data);

            const results = await scanFileWithVirusTotal(filePath);

            const detections = Object.entries(results)
                .map(([engine, data]) => `${engine}: ${data.category}`)
                .join('\n')
                .slice(0, 1900);

            const embed = new EmbedBuilder()
                .setTitle(`🛡️ VirusTotal Scan Results`)
                .setDescription(`**File:** ${attachment.name}`)
                .addFields({ name: 'Detection Results', value: detections || 'No threats detected ✅' })
                .setColor(detections.includes('malicious') ? 0xff0000 : 0x00ff00)
                .setFooter({ text: 'Data provided by VirusTotal' });

            await interaction.editReply({ embeds: [embed] });

            fs.unlinkSync(filePath);

        } catch (err) {
            console.error(err);
            await interaction.editReply('❌ Failed to scan file.');
        }
    }
};
