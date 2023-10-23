const fs = require('fs');
const { InteractionType, Client, Collection, GatewayIntentBits } = require('discord.js');
const { discordToken } = require('./tokens.json');
const { owners, enabledComponents } = require('./config.json');
const registerCommands = require('./register-commands.js');

// Temp storage for 2 part forms
global.wipForms = [];

global.removeWipForm = (form, timeout) => {
    if (timeout) clearTimeout(form.timeout);
    return wipForms.splice(wipForms.indexOf(form), 1);
};

global.addWipForm = (form) => {
    const existingForm = wipForms.findIndex(x => x.id === form.id);
    form.timeout = setTimeout(() => removeWipForm(this), 900000);

    if (existingForm === -1) {
        return wipForms.push(form);
    }
    else wipForms[existingForm] = form;
};

// Initialize client
global.client = new Client({
    intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers ],
    allowedMentions: { parse: ['users'], repliedUser: true },
    rest: { rejectOnRateLimit: ['/channels'] }
});

// Cache for wiki pages
client.pageCache = new Collection();

// Initialize local commands
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// Fill local commands
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if (command.subcommandGroups) {
        command.subcommandGroups.forEach((v, k) => {
            v.subcommands.forEach((vv, kk) => enabledComponents.includes(vv.component) ? v.data.addSubcommand(vv.data) : v.data.delete(kk));
            enabledComponents.includes(v.component) ? command.data.addSubcommandGroup(v.data) : command.subcommandGroups.delete(k);
        });
    }
    if (command.subcommands) command.subcommands.forEach((v, k) => enabledComponents.includes(v.component) ? command.data.addSubcommand(v.data) : command.subcommands.delete(k));
    if (enabledComponents.includes(command.component)) client.commands.set(command.data.name, command);
}

// Initialize local context menus
client.contextMenus = new Collection();
const contextMenus = fs.readdirSync('./contextMenus').filter(file => file.endsWith('.js'));

// Fill local context menus
for (const file of contextMenus) {
    const contextMenu = require(`./contextMenus/${file}`);
    if (enabledComponents.includes(contextMenu.component)) client.contextMenus.set(contextMenu.data.name, contextMenu);
}

// Initialize local modals
client.modals = new Collection();
const modalFiles = fs.readdirSync('./modals').filter(file => file.endsWith('.js'));

// Fill local modals
for (const file of modalFiles) {
    const modal = require(`./modals/${file}`);
    if (enabledComponents.includes(modal.component)) client.modals.set(file.slice(0, -3), modal);
}

// Initialize local buttons
client.buttons = new Collection();
const buttonFiles = fs.readdirSync('./buttons').filter(file => file.endsWith('.js'));

// Fill local buttons
for (const file of buttonFiles) {
    const button = require(`./buttons/${file}`);
    if (enabledComponents.includes(button.component)) client.buttons.set(file.slice(0, -3), button);
}

// Initialize local select menus
client.selectMenus = new Collection();
const selectMenuFiles = fs.readdirSync('./selectMenus').filter(file => file.endsWith('.js'));

// Fill local select menus
for (const file of selectMenuFiles) {
    const selectMenu = require(`./selectMenus/${file}`);
    if (enabledComponents.includes(selectMenu.component)) client.selectMenus.set(file.slice(0, -3), selectMenu);
}

registerCommands(client.commands.map(c => c.data).concat(client.contextMenus.map(c => c.data)));

// Interaction handler
client.on('interactionCreate', async interaction => {
    // Slash commands
    if (interaction.isChatInputCommand()) {
        // Get local equivalent and find subcommand
        let command = client.commands.get(interaction.commandName);
        if (command.subcommandGroups && interaction.options.getSubcommandGroup(false)) command = command.subcommandGroups.get(interaction.options.getSubcommandGroup()).subcommands.get(interaction.options.getSubcommand());
        else if (command.subcommands && interaction.options.getSubcommand(false)) command = command.subcommands.get(interaction.options.getSubcommand());

        // Restrict owner only commands
        if (command.ownerOnly && !owners.includes(interaction.user.id)) return interaction.reply({ content: 'Only the bot owners can use this command!', ephemeral: true });

        // Execute command
        command.execute(interaction).catch(error => {
            console.error(error);
            interaction.reply({ content: 'There was an error trying to execute that command!', ephemeral: true });
        });
    }
    // Autocomplete
    else if (interaction.isAutocomplete()) {
        // Get local equivalent
        let command = client.commands.get(interaction.commandName);
        if (command.subcommandGroups && interaction.options.getSubcommandGroup(false)) command = command.subcommandGroups.get(interaction.options.getSubcommandGroup()).subcommands.get(interaction.options.getSubcommand());
        else if (command.subcommands && interaction.options.getSubcommand(false)) command = command.subcommands.get(interaction.options.getSubcommand());

        // Autocomplete command
        command.autocomplete(interaction).catch(error => {
            console.error(error);
            interaction.reply({ content: 'There was an error trying to execute that command!', ephemeral: true });
        });
    }
    // Context menus
    else if (interaction.isUserContextMenuCommand()) {
        // Get local equivalent
        const contextMenu = client.contextMenus.get(interaction.commandName);

        // Restrict owner only commands (probably unnecessary feature)
        if (contextMenu.ownerOnly && !owners.includes(interaction.user.id)) return interaction.reply({ content: 'Only the bot owners can use this command!', ephemeral: true });

        // Execute command
        contextMenu.execute(interaction).catch(error => {
            console.error(error);
            interaction.reply({ content: 'There was an error trying to execute that command!', ephemeral: true });
        });
    }
    // Modal submits
    else if (interaction.type === InteractionType.ModalSubmit) {
        // Get local equivalent
        const pos = interaction.customId.indexOf('_');
        const modal = client.modals.get(pos === -1 ? interaction.customId : interaction.customId.slice(0, pos));

        // Execute command
        modal.onSubmit(interaction).catch(error => {
            console.error(error);
            interaction.reply({ content: 'There was an error trying to execute that command!', ephemeral: true });
        });
    }
    // Button presses
    else if (interaction.isButton()) {
        // Get local equivalent
        const pos = interaction.customId.indexOf('_');
        const button = client.buttons.get(pos === -1 ? interaction.customId : interaction.customId.slice(0, pos));

        // Execute command
        button.onPressed(interaction).catch(error => {
            console.error(error);
            interaction.reply({ content: 'There was an error trying to execute that command!', ephemeral: true });
        });
    }
    // selectMenu submits
    else if (interaction.isAnySelectMenu()) {
        // Get local equivalent
        const pos = interaction.customId.indexOf('_');
        const selectMenu = client.selectMenus.get(pos === -1 ? interaction.customId : interaction.customId.slice(0, pos));

        // Execute command
        selectMenu.onSelection(interaction).catch(error => {
            console.error(error);
            interaction.reply({ content: 'There was an error trying to execute that command!', ephemeral: true });
        });
    }
});

// Log on successful login
client.once('ready', () => {
    console.log('Interaction handling ready!');
});

// Login
client.login(discordToken);
