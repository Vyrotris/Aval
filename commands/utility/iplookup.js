const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getColor } = require('../../misc/colorUtil');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('iplookup')
        .setDescription('Performs an IP lookup with location thumbnail')
        .addStringOption(option =>
            option.setName('ip')
                .setDescription('The IP address to look up')
                .setRequired(true))
        .setIntegrationTypes([1])
        .setContexts([1, 2]),

    async run(interaction) {
        try {
            await interaction.deferReply();
            const ip = interaction.options.getString('ip');

            const geoResponse = await fetch(`https://ipwho.is/${ip}`);
            if (!geoResponse.ok) {
                throw new Error(`HTTP error! status: ${geoResponse.status}`);
            }
            const geoData = await geoResponse.json();

            if (!geoData.success) {
                await interaction.editReply('No data found for this IP address.');
                return;
            }

            const { city, region, country, latitude, longitude, timezone, connection, org } = geoData;

            const embed = new EmbedBuilder()
                .setTitle(`IP Lookup for ${ip}`)
                .setColor(getColor('info'))
                .addFields(
                    { name: 'City', value: city || 'N/A', inline: true },
                    { name: 'Region', value: region || 'N/A', inline: true },
                    { name: 'Country', value: country || 'N/A', inline: true },
                    { name: 'Latitude', value: latitude?.toString() || 'N/A', inline: true },
                    { name: 'Longitude', value: longitude?.toString() || 'N/A', inline: true },
                    { name: 'Timezone', value: timezone?.id || 'N/A', inline: true },
                    { name: 'Organization', value: org || 'N/A', inline: true },
                    { name: 'ASN', value: connection?.asn?.toString() || 'N/A', inline: true }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (err) {
            console.error('Error details:', err.message);
            await interaction.editReply(`❌ Something went wrong while performing the IP lookup. Error: ${err.message}`);
        }
    }
};