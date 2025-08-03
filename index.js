const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const fs = require('fs');
const path = require('path');
const config = require('./data/config.json');
require('dotenv').config();

require('./misc/serverCountAPI');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: ['CHANNEL']
});

client.commands = new Collection();

const activityType = ActivityType[config.activity.type] || ActivityType.Playing;

function loadCommands(dir = path.join(__dirname, 'commands')) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir, { withFileTypes: true });

    for (const file of files) {
        const fullPath = path.join(dir, file.name);

        if (file.isDirectory()) {
            loadCommands(fullPath);
            continue;
        }

        if (!file.isFile() || path.extname(file.name) !== '.js') continue;

        try {
            const command = require(fullPath);

            if (command.data && command.run) {
                const name = command.data.name.toLowerCase();

                if (!client.commands.has(name)) {
                    client.commands.set(name, command);
                    console.log(`Loaded: ${name} (${path.relative(__dirname, fullPath)})`);
                } else {
                    console.warn(`Duplicate skipped: ${name} (${path.relative(__dirname, fullPath)})`);
                }
            } else {
                console.warn(`Skipping invalid command file: ${path.relative(__dirname, fullPath)}`);
            }
        } catch (err) {
            console.error(`Error loading ${path.relative(__dirname, fullPath)}:`, err);
        }
    }
}

async function deployCommands() {
    const commandsArr = client.commands.map(cmd => cmd.data.toJSON());
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    try {
        console.log('Deploying commands...');
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commandsArr }
        );
        console.log('Commands deployed successfully');
    } catch (error) {
        console.error('Deploy failed:', error);
    }
}

loadCommands();

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
    const activityName = config.activity.name || 'vyrotris.com';
    const activityType = ActivityType[config.activity.type] || ActivityType.Playing;
    client.user.setActivity(activityName, { type: activityType });
    await deployCommands();
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.run(interaction);
    } catch (error) {
        console.error(`Error running command ${interaction.commandName}:`, error);
        const reply = { content: 'Command failed to execute.', ephemeral: true };
        try {
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(reply);
            } else {
                await interaction.reply(reply);
            }
        } catch (replyError) {
            console.error('Failed to send error reply:', replyError);
        }
    }
});

client.login(process.env.TOKEN);

module.exports = { client };