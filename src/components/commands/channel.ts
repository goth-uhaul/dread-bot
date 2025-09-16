import { SlashCommandBuilder, PermissionFlagsBits, SlashCommandSubcommandBuilder, MessageFlags, ChannelType, SlashCommandChannelOption, InteractionContextType } from "discord.js";

import { Command, Subcommand } from "../../lib/command";


const channelOption = () => new SlashCommandChannelOption().setName("channel").setDescription("The channel to update");

export default new Command({
    name: "channel",
    builder: new SlashCommandBuilder()
        .setDescription("Modifies a channel")
        .setDefaultMemberPermissions(PermissionFlagsBits.ViewAuditLog)
        .setContexts(InteractionContextType.Guild),
    subcommands: [
        new Subcommand({
            name: "slowmode",
            builder: new SlashCommandSubcommandBuilder()
                .setDescription("Sets the channel's slowmode")
                .addNumberOption(option => option
                    .setName("cooldown")
                    .setDescription("How long users must wait between messages, in seconds")
                    .setMinValue(0)
                    .setMaxValue(216000)
                    .setRequired(true))
                .addChannelOption(channelOption().addChannelTypes(ChannelType.GuildText)),
            moderatorOnly: true,
            execute: async (interaction) => {
                const channel = interaction.options.getChannel("channel", false, [ChannelType.GuildText]) || interaction.channel;
                if (!channel || channel.isDMBased()) return;

                const cd = interaction.options.getNumber("cooldown", true);
                await channel.setRateLimitPerUser(cd, `Slowmode set to ${cd} seconds by ${interaction.user.username}.`);
                interaction.reply({ content: "Channel updated successfully.", flags: MessageFlags.Ephemeral });
            },
        }),
        new Subcommand({
            name: "rename",
            builder: new SlashCommandSubcommandBuilder()
                .setDescription("Changes the channel's name")
                .addStringOption(option => option
                    .setName("name")
                    .setDescription("The new channel name")
                    .setMinLength(1)
                    .setMaxLength(100)
                    .setRequired(true))
                .addChannelOption(channelOption().addChannelTypes(ChannelType.GuildText)),
            moderatorOnly: true,
            execute: async (interaction) => {
                const channel = interaction.options.getChannel("channel", false, [ChannelType.GuildText]) || interaction.channel;
                if (!channel || channel.isDMBased()) return;

                const newName = interaction.options.getString("name", true);
                if (interaction.inGuild()) await channel.setName(newName, `Channel name changed to #${newName} by ${interaction.user.username}.`);
                interaction.reply({ content: "Channel updated successfully.", flags: MessageFlags.Ephemeral });
            },
        }),
        new Subcommand({
            name: "topic",
            builder: new SlashCommandSubcommandBuilder()
                .setDescription("Sets the channel's description")
                .addChannelOption(channelOption),
            moderatorOnly: true,
            execute: async (interaction) => {
                const channel = interaction.options.getChannel("channel", false, [ChannelType.GuildText]) || interaction.channel;
                if (!channel || channel.isDMBased()) return;

                interaction.showModal(interaction.client.createModal("channelTopic", channel.id));
            },
        }),
    ]
});
