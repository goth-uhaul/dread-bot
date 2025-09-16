# Dread Bot
A Discord bot specifically made for the Metroid Dread Speedrunning [Discord server](https://discord.gg/BdmYr5TRGT).

# Set-Up
To get the bot running, you should set up the following in `config.json`:
```
{
	"enabledComponents": ["functionality"], // array of strings, containing enabled bot components
	"clientId": "", // client's ID here
	"owners": [], // array of strings, containing IDs of discord users who can execute owner only commands (i.e. /eval)
	"wikiDomain": "", // wiki URL here (i.e. dreadwiki.hijumpboots.com)
	"graphQlDomain": "", // URL for api calls here (i.e. dreadwiki.hijumpboots.com or localhost:4000)
	"contributorRole": "", // ID of wiki contributor role here (for /wiki verify)
    "srcRole": "", // ID of SRC verified role here (for /src verify)
    "moderatorRole": "", // ID of moderator role here (for moderation commands)
	"streamsChannel": "", // ID of channel for streams to be posted in
	"streamingRole": "" // ID of role for streaming users to be given
}
```
The bot components can be: functionality, utility, wiki, moderation, src, streams. **Never disable the functionality component.**

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
Simple command:
```
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder(),
    component: '',
    execute(interaction) {
        return new Promise((resolve, reject) => {});
    },
    // Optional
    autocomplete(interaction) {
        return new Promise((resolve, reject) => {});
    }
};
```
Command with subcommands/subcommand groups:
```
const { SlashCommandBuilder, Collection, SlashCommandSubcommandGroupBuilder, SlashCommandSubcommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder(),
    component: '',
    // Optional if using subcommands
    subcommandGroups: new Collection([
        ['subcommandGroupName', {
            data: new SlashCommandSubcommandGroupBuilder(),
            component: '',
            subcommands: new Collection([
                ['subcommandName', {
                    data: new SlashCommandSubcommandBuilder(),
                    component: '',
                    execute(interaction) {
                        return new Promise((resolve, reject) => {});
                    },
                    // Optional
                    autocomplete(interaction) {
                        return new Promise((resolve, reject) => {});
                    }
                }]
            ])
        }]
    ]),
    // Optional if using subcommandGroups
    subcommands: new Collection([
        ['subcommandName', {
            data: new SlashCommandSubcommandBuilder(),
            component: '',
            execute(interaction) {
                return new Promise((resolve, reject) => {});
            },
            // Optional
            autocomplete(interaction) {
                return new Promise((resolve, reject) => {});
            }
        }]
    ])
};
```

## `/contextMenus/`
```
const { ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');

module.exports = {
    data: new ContextMenuCommandBuilder(),
    component: '',
    execute(interaction) {
        return new Promise((resolve, reject) => {});
    },
};
```

## `/buttons/`
```
const { ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    button: () => new ButtonBuilder(),
    component: '',
    onPressed: (interaction) => return new Promise((resolve, reject) => {});
};
```

## `/modals/`
```
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    modal: () => new ModalBuilder(),
    component: '',
    onSubmit(interaction) {
        return new Promise((resolve, reject) => {});
    }
};
```

## `/selectMenus/`
```
const { SelectMenuBuilder } = require('discord.js');

module.exports = {
    selectMenu: () => new SelectMenuBuilder(),
    component: '',
    onSelection: (interaction) => return new Promise((resolve, reject) => {});
};

```

## `/databases/models/`
```
module.exports = (sequelize, DataTypes) => return sequelize.define();
```
