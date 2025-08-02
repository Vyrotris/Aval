const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getColor } = require('../../misc/colorUtil');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('whenwillanthonyandjacobmeetupirl')
        .setDescription('Find out when Anthony and Jacob will meet up in real life!')
        .setIntegrationTypes([1])
        .setContexts([1, 2]),
    async run(interaction) {
        const meetupDate = new Date('2025-08-15T00:00:00-05:00'); // EST timezone
        const now = new Date();
        
        const timeDiff = meetupDate.getTime() - now.getTime();
        
        if (timeDiff <= 0) {
            const embed = new EmbedBuilder()
                .setTitle('🎉 Anthony and Jacob Meetup')
                .setDescription('Anthony and Jacob have already met up in real life! Hope it was awesome!')
                .setColor(getColor('8ball'))
                .setTimestamp();
            
            await interaction.reply({ embeds: [embed] });
            return;
        }
        
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
        
        let countdownText = '';
        if (days > 0) countdownText += `${days} day${days !== 1 ? 's' : ''} `;
        if (hours > 0) countdownText += `${hours} hour${hours !== 1 ? 's' : ''} `;
        if (minutes > 0) countdownText += `${minutes} minute${minutes !== 1 ? 's' : ''} `;
        countdownText += `${seconds} second${seconds !== 1 ? 's' : ''}`;
        
        const embed = new EmbedBuilder()
            .setTitle('⏰ Anthony and Jacob IRL Meetup Countdown')
            .setDescription(`Anthony and Jacob will meet up in real life in **${countdownText}**`)
            .addFields(
                { name: 'Meetup Date', value: 'August 15, 2025 (EST)', inline: true },
                { name: 'Time Remaining', value: countdownText, inline: true }
            )
            .setColor(getColor('8ball'))
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
    }
};
