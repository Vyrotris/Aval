const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const yahooFinance = require('yahoo-finance2').default;
const { getColor } = require('../../misc/colorUtil');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stock')
    .setDescription('Get the current stock price for a symbol')
    .addStringOption(option =>
      option
        .setName('symbol')
        .setDescription('Ticker symbol, e.g. AAPL, TSLA')
        .setRequired(true)
    )
    .setIntegrationTypes([1])
    .setContexts([0, 1, 2]),

  async run(interaction) {
    const symbol = interaction.options.getString('symbol').toUpperCase();

    await interaction.reply({ content: `Fetching data for ${symbol}...`, fetchReply: true });

    try {
      const quote = await yahooFinance.quote(symbol);
      const embed = new EmbedBuilder()
        .setTitle(`📈 ${symbol} Stock Price`)
        .setColor(getColor('primary'))
        .addFields(
        { name: 'Name', value: quote.longName ?? symbol ?? 'N/A', inline: true },
        { name: 'Price', value: (quote.regularMarketPrice != null && quote.currency) ? `${quote.regularMarketPrice} ${quote.currency}` : 'N/A', inline: true },
        { name: 'Exchange', value: quote.fullExchangeName ?? 'N/A', inline: true }
        )
        .setFooter({ text: `Requested by ${interaction.user.username}` })
        .setTimestamp();

      await interaction.editReply({ content: '', embeds: [embed] });

    } catch (err) {
      console.error(err);
      await interaction.editReply(`❌ Unable to fetch stock data for ${symbol}.`);
    }
  }
};