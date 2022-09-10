const fs = require('fs');
const { Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { enabledComponents, clientId } = require('./config.json');
const { discordToken } = require('./tokens.json');

let commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

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