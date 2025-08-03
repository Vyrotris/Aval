const { SlashCommandBuilder } = require('discord.js');
const { OpenAI } = require('openai');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/config.json'), 'utf8'));

function sanitizeInput(input) {
  return input.trim().slice(0, 150).replace(/[\r\n]+/g, ' ');
}

function extractJSON(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

async function wikiSummary(query) {
  try {
    const res = await axios.get(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`
    );
    if (res.data && res.data.extract) return res.data.extract;
  } catch {
      return null;
  }
  return null;
}

async function duckDuckGoSummary(query) {
  try {
    const res = await axios.get('https://api.duckduckgo.com/', {
      params: { q: query, format: 'json', no_html: 1 }
    });
    const data = res.data;
    if (data.AbstractText && data.AbstractText.length > 0) {
      return data.AbstractText;
    }
    if (data.Definition && data.Definition.length > 0) {
      return data.Definition;
    }
    if (Array.isArray(data.RelatedTopics) && data.RelatedTopics.length > 0) {
      for (const topic of data.RelatedTopics) {
        if (topic.Text) return topic.Text;
        if (topic.Topics && Array.isArray(topic.Topics)) {
          const nested = topic.Topics.find(t => t.Text);
          if (nested) return nested.Text;
        }
      }
    }
  } catch {
      return null;
  }
  return null;
}

async function urbanDictionaryDefinition(query) {
  try {
    const res = await axios.get('https://api.urbandictionary.com/v0/define', {
      params: { term: query }
    });
    if (res.data.list && res.data.list.length > 0) {
      return res.data.list[0].definition.replace(/\[|\]/g, '');
    }
  } catch {
      return null;
  }
  return null;
}

async function combinedLookup(query) {
  const [wiki, duck, urban] = await Promise.all([
    wikiSummary(query),
    duckDuckGoSummary(query),
    urbanDictionaryDefinition(query)
  ]);
  
  const combined = [urban, wiki, duck].filter(Boolean).join('\n\n');

  return combined || null;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rate')
    .setDescription('Rate something using AI, with combined web lookup')
    .addStringOption(option =>
      option.setName('thing')
        .setDescription('What should I rate?')
        .setRequired(true)
    )
    .setIntegrationTypes([1])
    .setContexts([0, 1, 2]),

  async run(interaction) {
    try {
      await interaction.deferReply();

      const thingRaw = interaction.options.getString('thing');
      const thing = sanitizeInput(thingRaw);

      let summary = await combinedLookup(thing);
      if (!summary) summary = 'No reliable information found online.';

      const prompt = `
You are an AI that rates items from 1 to 10 and provides a short, matching comment.
- If you recognize the item, rate from experience.
- If you're unfamiliar, use this combined information to learn about it:
"""${summary}"""

Tone:
- 1–3: brutally honest or slightly rude
- 4–6: neutral or cheeky
- 7–10: positive and enthusiastic

Respond ONLY in this JSON format:
{"rating": X, "comment": "Your short comment"}

Item: ${thing}
`;

      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: config.ai_prompt },
          { role: 'user', content: prompt }
        ]
      });

      const parsed = extractJSON(response.choices[0].message.content.trim());

      if (!parsed || typeof parsed.rating !== 'number' || typeof parsed.comment !== 'string') {
        throw new Error('Failed to parse AI response as JSON');
      }

      await interaction.editReply(
        `I rate **${thing}** a **${parsed.rating}/10** — ${parsed.comment}`
      );

    } catch (err) {
      console.error(err);
      await interaction.editReply('Failed to get a rating from AI.');
    }
  }
};