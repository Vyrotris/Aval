const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: ['CHANNEL']
});

client.commands = new Collection();

function loadCommands(dir = path.join(__dirname, 'commands')) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory()) {
            loadCommands(fullPath);
        } else if (file.isFile() && file.name.endsWith('.js')) {
            try {
                const command = require(fullPath);
                if (command.data && command.run) {
                    client.commands.set(command.data.name, command);
                    console.log(`Loaded: ${command.data.name}`);
                } else {
                    console.warn(`Skipping file (missing data or run): ${fullPath}`);
                }
            } catch (err) {
                console.error(`Error loading command at ${fullPath}:`, err);
            }
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
