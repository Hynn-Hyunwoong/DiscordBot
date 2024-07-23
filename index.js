console.log('Starting bot...');
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const fs = require('fs');
const { token } = require('./config/environment');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildInvites,
    ],
    partials: [Partials.Channel, Partials.Message, Partials.Reaction, Partials.User, Partials.GuildMember],
});

client.commands = new Collection();

client.login(token).catch(err => {
    console.error('Login failed:', err);
});

// Load event handlers from all subdirectories in the handler directory
const handlerDirs = fs.readdirSync('./handler').filter(dir => fs.lstatSync(`./handler/${dir}`).isDirectory());

for (const dir of handlerDirs) {
    const eventFiles = fs.readdirSync(`./handler/${dir}`).filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
        const event = require(`./handler/${dir}/${file}`);
        if (event.name === 'ready') {
            client.once(event.name, (...args) => event.run(...args, client));
        } else {
            client.on(event.name, (...args) => event.run(...args, client));
        }
        if (event.customId) {
            client.commands.set(event.customId, event);
        }
    }
}

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});
process.on('uncaughtException', error => {
    console.error('Uncaught exception:', error);
});

console.log('Bot setup complete');
