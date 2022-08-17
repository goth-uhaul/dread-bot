Discord = require('discord.js');
fs = require('fs');
const { discordToken } = require('./tokens.json');
const { owners } = require('./config.json');

// Initialize client
global.client = new Discord.Client({
	intents: [],
	allowedMentions: { parse: ['users'], repliedUser: true }
});

// Initialize local commands
client.commands = new Discord.Collection();
let commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// Fill local commands
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

// Command handler
client.on('interactionCreate', async interaction => {
	// Get local equivalent
	const command = client.commands.get(interaction.commandName);

	// Restrict owner only commands
	if (command.ownerOnly && !owners.includes(interaction.user.id)) return interaction.reply('Only the bot owners can use this command!');

	// Execute command
	command.execute(interaction)
	.catch(error => {
		console.error(error);
		interaction.reply('There was an error trying to execute that command!');
	});
});

// Log on successful login
client.once('ready', () => {
	console.log('Ready!');
});

// Login
client.login(discordToken);
