# Dread Bot
A Discord bot specifically made for the Metroid Dread speedrunning [Discord server](https://discord.gg/BdmYr5TRGT).

# Set-Up
To get the bot running, you should set up the following in `config.json`:
```
{
	"enabledComponents": ["functionality"], // array of strings, containing enabled bot components
	"clientId": "", // client's ID here
	"owners": [], // array of strings, containing IDs of discord users who can execute owner only commands (i.e. /eval)
	"wikiDomain": "", // wiki URL here (i.e. dreadwiki.hijumpboots.com)
	"graphQlDomain": "", // URL for api calls here (i.e. dreadwiki.hijumpboots.com or localhost:4000)
	"contributorRole": "", // ID of wiki contributor role here (for /verify)
	"applicationChannel": "", // ID of channel to send teacher applications to here
	"positions": [
		// array of objects, representing teacher positions. these are in the following format:
		// label: position name, description: description of position (use \u200b to leave empty), value: ID of corresponding teacher role
		{ "label": "", "description": "", "value": "" },
	]
}
```
The bot components can be: functionality, utility, wiki, bootcamp. **Never disable the functionality component.**

As well, please generate a Discord token, and if using the wiki component, a Wiki.JS API key. These should go into `tokens.json` in the following format:
```
{
    "discordToken": "",
    "wikiToken": ""
}
```
Finally, run `databases/dbInit.js` in order to initialize the bot's databases.

# Template Files
## `/commands/`
```
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder(),
    component: '',
    execute(interaction) {
        return new Promise(async (resolve, reject) => {});
    },
    // Optional
    autocomplete(interaction) {
        return new Promise((resolve, reject) => {});
    }
};
```

## `/buttons/`
```
const { ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    button: () => new ButtonBuilder(),
    component: '',
    onPressed: (interaction) => {
        return new Promise(async (resolve, reject) => {});
    }
};
```

## `/modals/`
```
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");

module.exports = {
    modal: new ModalBuilder(),
    component: '',
    onSubmit(interaction) {
        return new Promise(async (resolve, reject) => {}});
    }
};
```

## `/selectMenus/`
```
const { SelectMenuBuilder } = require('discord.js');

module.exports = {
    selectMenu: () => new SelectMenuBuilder(),
    component: '',
    onSelection: (interaction) => {
        return new Promise(async (resolve, reject) => {});
    }
};

```

## `/databases/models/`
```
module.exports = (sequelize, DataTypes) => {
    return sequelize.define();
}
```
