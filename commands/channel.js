const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { moderatorRole } = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('channel')
        .setDescription('Modifies a channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ViewAuditLog)
        .setDMPermission(false)
        .addSubcommand(subcommand =>
            subcommand.setName('slowmode')
            .setDescription('Sets the channel\'s slowmode')
            .addChannelOption(option =>
                option.setName('channel')
                .setDescription('The channel to update')
                .setRequired(true))
            .addNumberOption(option =>
                option.setName('cooldown')
                .setDescription('How long users must wait between messages, in seconds')
                .setMinValue(0)
                .setMaxValue(216000)
                .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('rename')
            .setDescription('Changes the channel\'s name')
            .addChannelOption(option =>
                option.setName('channel')
                .setDescription('The channel to update')
                .setRequired(true))
            .addStringOption(option =>
                option.setName('name')
                .setDescription('The new channel name')
                .setMinLength(1)
                .setMaxLength(100)
                .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('topic')
            .setDescription('Sets the channel\'s description')
            .addChannelOption(option =>
                option.setName('channel')
                .setDescription('The channel to update')
                .setRequired(true))),
    component: 'moderation',
    execute(interaction) {
        return new Promise(async (resolve, reject) => {
            if (!interaction.member.roles.cache.has(moderatorRole)) return interaction.reply({ content: 'You don\'t have permission to execute this command!', ephemeral: true }).then(resolve()).catch(reject);

            const subcommand = interaction.options.getSubcommand();
            const channel = interaction.options.getChannel('channel');

            if (subcommand === 'slowmode') {
                const cd = interaction.options.getNumber('cooldown');
                await channel.setRateLimitPerUser(cd, 'Slowmode set to ' + cd + ' seconds by ' + interaction.user.username + '.').then(resolve()).catch(e => reject(e));
                interaction.reply({ content: 'Channel updated successfully.', ephemeral: true }).then(resolve()).catch(reject);
            }
            else if (subcommand === 'rename') {
                const newName = interaction.options.getString('name');
                await channel.setName(newName, 'Channel name changed to #' + newName + ' by ' + interaction.user.username + '.');
                interaction.reply({ content: 'Channel updated successfully.', ephemeral: true }).then(resolve()).catch(e => reject(e));
            }
            else if (subcommand === 'topic') {
                interaction.showModal(client.modals.get('channelTopic').modal(channel.id));
            }
        });
    },
    autocomplete(interaction) {
        return new Promise((resolve, reject) => {});
    }
};