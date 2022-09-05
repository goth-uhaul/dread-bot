Discord = require('discord.js');
const { InteractionType } = require('discord.js');
fs = require('fs');
const Sequelize = require('sequelize');
const { discordToken } = require('./tokens.json');
const { owners } = require('./config.json');

// Initialize sequelize
let sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite'
});

// Create responses model
global.TeacherResponses = sequelize.define('teacherResponses', {
	userId: {
		type: Sequelize.STRING,
		unique: true
	},
	discordName: Sequelize.STRING,
	srcName: Sequelize.STRING,
	positions: Sequelize.STRING,
	timeRunning: Sequelize.STRING,
	hardware: Sequelize.STRING,
	strength: Sequelize.TEXT,
	weakness: Sequelize.TEXT,
	backupStrats: Sequelize.TEXT,
	otherStrats: Sequelize.TEXT,
	comments: Sequelize.TEXT,
	upvotes: Sequelize.TEXT,
	downvotes: Sequelize.TEXT,
	status: Sequelize.STRING
});

// Temp storage for 2 part forms
global.wipForms = [];

global.removeWipForm = (form, timeout) => {
	if (timeout) clearTimeout(form.timeout);
	return wipForms.splice(wipForms.indexOf(form), 1);
}

global.addWipForm = (form) => {
	let existingForm = wipForms.findIndex(x => x.id === form.id);
	form.timeout = setTimeout(() => removeWipForm(this), 900000);

	if (existingForm === -1) {
		return wipForms.push(form);
	}
	else wipForms[existingForm] = form;
}

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

// Initialize local modals
client.modals = new Discord.Collection();
let modalFiles = fs.readdirSync('./modals').filter(file => file.endsWith('.js'));

// Fill local modals
for (const file of modalFiles) {
    const modal = require(`./modals/${file}`);
    client.modals.set(modal.modal.data.custom_id, modal);
}

// Initialize local buttons
client.buttons = new Discord.Collection();
let buttonFiles = fs.readdirSync('./buttons').filter(file => file.endsWith('.js'));

// Fill local buttons
for (const file of buttonFiles) {
    const button = require(`./buttons/${file}`);
    client.buttons.set(file.slice(0, -3), button);
}

// Initialize local select menus
client.selectMenus = new Discord.Collection();
let selectMenuFiles = fs.readdirSync('./selectMenus').filter(file => file.endsWith('.js'));

// Fill local select menus
for (const file of selectMenuFiles) {
    const selectMenu = require(`./selectMenus/${file}`);
    client.selectMenus.set(file.slice(0, -3), selectMenu);
}

// Interaction handler
client.on('interactionCreate', async interaction => {
	// Slash commands
	if (interaction.isChatInputCommand()) {
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
	}
	// Modal submits
	else if (interaction.type === InteractionType.ModalSubmit) {
		// Get local equivalent
		const modal = client.modals.get(interaction.customId);

		// Execute command
		modal.onSubmit(interaction)
		.catch(error => {
			console.error(error);
			interaction.reply('There was an error!');
		});
	}
	// Button presses
	else if (interaction.isButton()) {
		// Get local equivalent
		let pos = interaction.customId.indexOf('_');
		const button = client.buttons.get(pos === -1 ? interaction.customId : interaction.customId.slice(0, pos));

		// Execute command
		button.onPressed(interaction)
		.catch(error => {
			console.error(error);
			interaction.reply('There was an error!');
		});
	}
	// selectMenu submits
	else if (interaction.isSelectMenu()) {
		// Get local equivalent
		const selectMenu = client.selectMenus.get(interaction.customId);

		// Execute command
		selectMenu.onSelection(interaction)
		.catch(error => {
			console.error(error);
			interaction.reply('There was an error!');
		});
	}
});

// Log on successful login
client.once('ready', () => {
	TeacherResponses.sync({ force: true });
	console.log('Ready!');
});

// Login
client.login(discordToken);
