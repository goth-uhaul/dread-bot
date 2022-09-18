const { ButtonBuilder, ButtonStyle, EmbedBuilder, ActionRowBuilder } = require("discord.js");

const sectionToEmbed = (section) => {
    let embed = new EmbedBuilder().setTitle(section.header);
    if (section.body) embed.setDescription(section.body);
    if (section.image) embed.setImage(section.image);
    if (section.subsections) section.subsections.map(x => embed.addFields({ name: x.header, value: x.body ? x.body : '\u200b' }));

    return embed;
}

module.exports = {
    button: (id) => new ButtonBuilder()
        .setCustomId('pageForward_' + id)
        .setLabel('Next Section')
        .setStyle(ButtonStyle.Primary),
    component: 'wiki',
    onPressed: (interaction) => {
        return new Promise(async (resolve, reject) => {
            let pageId = parseInt(interaction.customId.slice(12));

            let page = client.pageCache.get(pageId).content;
            let current = page.indexOf(page.find(x => x.header === interaction.message.embeds[0].title));

            let toSend = { embeds: [sectionToEmbed(page[current + 1])] };
            if (page.length === current + 2) toSend.components = [new ActionRowBuilder().addComponents(client.buttons.get('pageBack').button(pageId), client.buttons.get('pageForward').button(pageId).setDisabled(true))];
            else if (interaction.message.components[0].components[0].disabled) toSend.components = [new ActionRowBuilder().addComponents(client.buttons.get('pageBack').button(pageId), client.buttons.get('pageForward').button(pageId))];

            interaction.update(toSend).then(resolve()).catch(e => reject(e));
        });
    }
};
