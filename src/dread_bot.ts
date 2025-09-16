import { ActivityType, Events, GatewayIntentBits, MessageFlags } from "discord.js";

import { BotConfigTable, StreamBlacklistTable } from "./databases/db_objects";
import { DreadClient } from "./lib/client";
import { objectsArrayEquals, streamEmbed } from "./lib/utils";
import registerCommands from "./register_commands";

import { discordToken } from "../tokens.json";


// Initialize client
const dreadClient = new DreadClient({
    intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildPresences ],
    allowedMentions: { parse: ["users"], repliedUser: true },
    rest: { rejectOnRateLimit: ["/channels"] },
});
await dreadClient.init();

registerCommands([...(dreadClient.commands.map(c => c.builder.toJSON())), ...dreadClient.userContextMenus.map(c => c.builder.toJSON())]);

// Interaction handler
dreadClient.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isAutocomplete()) {
        const command = dreadClient.getCommand(interaction.commandName, interaction.options);
        try {
            await command.autocomplete(interaction);
        }
        catch(error) {
            console.error(error);
        };
    }
    else {
        const component = dreadClient.getComponent(interaction);
        try {
            await component.execute(interaction);
        }
        catch(error) {
            console.error(error);
            interaction.reply({ content: "There was an error while processing that interaction.", flags: MessageFlags.Ephemeral });
        };
    }
});

dreadClient.on(Events.PresenceUpdate, async (oldPresence, newPresence) => {
    if (
        !newPresence.guild
        || !newPresence.user
        || !newPresence.member
    ) return;

    const streamsChannel = await BotConfigTable.findOne({ where: { id: "streamsChannel", guild: newPresence.guild.id } }).then(x => x?.get("value"));
    const streamingRole = await BotConfigTable.findOne({ where: { id: "streamingRole", guild: newPresence.guild.id } }).then(x => x?.get("value"));
    if (!streamsChannel || !streamingRole) return;

    const newStreams = newPresence.activities.filter(activity => activity.type === ActivityType.Streaming && activity.state === "Metroid Dread");
    const oldStreams = oldPresence?.activities.filter(activity => activity.type === ActivityType.Streaming && activity.state === "Metroid Dread") || [];
    if (newStreams.length > 0) {
        if (!oldPresence || !objectsArrayEquals(newStreams, oldStreams)) {
            const user = await StreamBlacklistTable.findOne({ where: { userId: newPresence.user.id } });
            if (!user) {
                newStreams.forEach(async (stream) => {
                    const channel = await dreadClient.channels.fetch(streamsChannel);
                    if (channel?.isSendable() && newPresence.user) channel.send({ embeds: [streamEmbed(stream, newPresence.user)] });
                });
                newPresence.member.roles.add(streamingRole);
            }
        }
    }
    else if (oldStreams.length > 0) {
        newPresence.member.roles.remove(streamingRole);
    }
});

// Log on successful login
dreadClient.once(Events.ClientReady, () => {
    console.log("Interaction handling ready.");
});

// Login
dreadClient.login(discordToken);
