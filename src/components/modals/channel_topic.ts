import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, MessageFlags } from "discord.js";

import { Modal } from "../../lib/modal";


const topicInput = new TextInputBuilder()
    .setCustomId("channelTopicTopic")
    .setLabel("Please write the new channel topic below.")
    .setStyle(TextInputStyle.Paragraph)
    .setMaxLength(1024)
    .setRequired(true);

const topicActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(topicInput);

export default new Modal({
    name: "channelTopic",
    builder: (id) => new ModalBuilder()
        .setCustomId("channelTopic_" + id)
        .setTitle("New Channel Topic")
        .addComponents(topicActionRow),
    execute: async (interaction) => {
        if (!interaction.inCachedGuild()) return;

        const id = interaction.customId.slice(13);
        const newTopic = interaction.fields.getTextInputValue("channelTopicTopic");
        const channel = interaction.guild.channels.cache.get(id);
        if (!channel || !channel.isTextBased() || channel.isThread() || channel.isVoiceBased()) throw Error(`Invalid channel ${id}.`);

        await channel.setTopic(newTopic, `Channel topic set to ${newTopic} by ${interaction.user.username}.`);
        interaction.reply({ content: "Channel updated successfully.", flags: MessageFlags.Ephemeral });
    }
});
