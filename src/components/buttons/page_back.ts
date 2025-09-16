import { ButtonBuilder, ButtonStyle, ActionRowBuilder, InteractionUpdateOptions } from "discord.js";

import { Button } from "../../lib/button";
import { pageSectionEmbed } from "../../lib/utils";


export default new Button({
    name: "pageBack",
    builder: (id) => new ButtonBuilder()
        .setCustomId("pageBack_" + id)
        .setLabel("Previous Section")
        .setStyle(ButtonStyle.Primary),
    execute: async (interaction) => {
        const pageId = parseInt(interaction.customId.slice(9));

        const page = interaction.client.getCachedPage(pageId).content;
        const currentPage = page.find(x => x.header === interaction.message.embeds[0].title);
        if (!currentPage) throw Error();
        const currentIndex = page.indexOf(currentPage);

        const toSend: InteractionUpdateOptions = { embeds: [pageSectionEmbed(page[currentIndex - 1])] };
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            interaction.client.createButton("pageBack", pageId).setDisabled(true),
            interaction.client.createButton("pageForward", pageId),
        )
        if (currentIndex - 1 === 0) toSend.components = [row];
        else if (interaction.message.resolveComponent(`pageForward_${pageId}`)?.disabled) toSend.components = [new ActionRowBuilder<ButtonBuilder>().addComponents(
            interaction.client.createButton("pageBack", pageId),
            interaction.client.createButton("pageForward", pageId),
        )];

        interaction.update(toSend);
    }
});
