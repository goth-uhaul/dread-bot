const { Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { clientId } = require('./config.json');
const { discordToken } = require('./tokens.json');

const rest = new REST({ version: '10' }).setToken(discordToken);

module.exports = async (commands) => {
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
};
