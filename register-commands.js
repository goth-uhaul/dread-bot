const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');
const { enabledComponents } = require('./config.json');
const { discordToken } = require('./tokens.json');
const fs = require('node:fs');

let commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

const clientId = '1008998631698866176';

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	if (enabledComponents.includes(command.component)) commands.push(command.data.toJSON());
	else delete command;
}

console.log(commands)

const rest = new REST({ version: '10' }).setToken(discordToken);

(async () => {
	try {
		console.log('Started refreshing application (/) commands.');

		await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		);

		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	}
})();