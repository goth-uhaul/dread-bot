const { ButtonBuilder, ButtonStyle, EmbedBuilder, ActionRowBuilder } = require('discord.js');

const sectionToEmbed = (section) => {
    const embed = new EmbedBuilder().setTitle(section.header);
    if (section.body) embed.setDescription(section.body);
    if (section.image) embed.setImage(section.image);
    if (section.subsections) section.subsections.map(x => embed.addFields({ name: x.header, value: x.body ? x.body : '\u200b' }));

    return embed;
};

module.exports = {
    button: (id) => new ButtonBuilder()
        .setCustomId('pageBack_' + id)
        .setLabel('Previous Section')
        .setStyle(ButtonStyle.Primary),
    component: 'wiki',
    onPressed: (interaction) => new Promise(async (resolve, reject) => {
        const pageId = parseInt(interaction.customId.slice(9));

        const page = client.pageCache.get(pageId).content;
        const current = page.indexOf(page.find(x => x.header === interaction.message.embeds[0].title));

        const toSend = { embeds: [sectionToEmbed(page[current - 1])] };
        if (current - 1 === 0) toSend.components = [new ActionRowBuilder().addComponents(client.buttons.get('pageBack').button(pageId).setDisabled(true), client.buttons.get('pageForward').button(pageId))];
        else if (interaction.message.components[0].components[1].disabled) toSend.components = [new ActionRowBuilder().addComponents(client.buttons.get('pageBack').button(pageId), client.buttons.get('pageForward').button(pageId))];

        interaction.update(toSend).then(resolve()).catch(e => reject(e));
    })
};
