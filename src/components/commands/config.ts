import { SlashCommandBuilder, SlashCommandSubcommandGroupBuilder, SlashCommandSubcommandBuilder, InteractionContextType, PermissionFlagsBits } from "discord.js";

import { BotConfig } from "../../databases/db_models";
import { Command, Subcommand, SubcommandGroup } from "../../lib/command";


const createRoleConfigSubcommand = (name: string, databaseId: string, description: string, shortDescription: string) => new Subcommand({
    name: name,
    builder: new SlashCommandSubcommandBuilder()
        .setDescription(`Configure ${description}`)
        .addRoleOption(option => option
            .setName(name)
            .setDescription(description[0].toUpperCase() + description.slice(1))
            .setRequired(true)
        ),
    moderatorOnly: true,
    ownerOnly: true,
    execute: async (interaction) => {
        if (!interaction.inCachedGuild()) throw Error("Guild not cached.");

        const role = interaction.options.getRole(name, true);
        await BotConfig.upsert({
            id: databaseId,
            value: role.id,
            guild: interaction.guild.id,
        });
        await interaction.reply(`Successfully updated config for ${shortDescription} to ${role}.`);
    },
});

const createChannelConfigSubcommand = (name: string, databaseId: string, description: string, shortDescription: string) => new Subcommand({
    name: name,
    builder: new SlashCommandSubcommandBuilder()
        .setDescription(`Configure ${description}`)
        .addChannelOption(option => option
            .setName(name)
            .setDescription(description[0].toUpperCase() + description.slice(1))
            .setRequired(true)
        ),
    moderatorOnly: true,
    ownerOnly: true,
    execute: async (interaction) => {
        if (!interaction.inCachedGuild()) throw Error("Guild not cached.");

        const channel = interaction.options.getChannel(name, true);
        await BotConfig.upsert({
            id: databaseId,
            value: channel.id,
            guild: interaction.guild.id,
        });
        await interaction.reply(`Successfully updated config for ${shortDescription} to ${channel}.`);
    },
});

export default new Command({
    name: "config",
    builder: new SlashCommandBuilder()
        .setDescription("Configure the bot")
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    moderatorOnly: true,
    ownerOnly: true,
    subcommandGroups: [
        new SubcommandGroup({
            name: "streams",
            builder: new SlashCommandSubcommandGroupBuilder().setDescription("Configure stream-posting functionality"),
            moderatorOnly: true,
            ownerOnly: true,
            subcommands: [
                createRoleConfigSubcommand("role", "streamingRole", "the role to grant users streaming", "streaming role"),
                createChannelConfigSubcommand("channel", "streamsChannel", "the channel to post streams in", "streams channel"),
            ],
        }),
        new SubcommandGroup({
            name: "moderation",
            builder: new SlashCommandSubcommandGroupBuilder().setDescription("Configure moderation functionality"),
            moderatorOnly: true,
            ownerOnly: true,
            subcommands: [
                createRoleConfigSubcommand("role", "moderatorRole", "the role to check before executing moderator commands", "moderator role"),
            ],
        }),
        new SubcommandGroup({
            name: "wiki",
            builder: new SlashCommandSubcommandGroupBuilder().setDescription("Configure wiki functionality"),
            moderatorOnly: true,
            ownerOnly: true,
            subcommands: [
                createRoleConfigSubcommand("role", "contributorRole", "the role to grant wiki contributors", "wiki contributor role"),
            ],
        }),
        new SubcommandGroup({
            name: "src",
            builder: new SlashCommandSubcommandGroupBuilder().setDescription("Configure speedrun.com functionality"),
            moderatorOnly: true,
            ownerOnly: true,
            subcommands: [
                createRoleConfigSubcommand("role", "srcRole", "the role to grant verified runners", "SRC role"),
            ],
        }),
    ],
});
