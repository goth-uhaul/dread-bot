import axios from "axios";
import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, SlashCommandSubcommandGroupBuilder, SlashCommandSubcommandBuilder, AutocompleteInteraction, InteractionReplyOptions, Collection, MessageFlags, ButtonBuilder } from "discord.js";

import { BotConfigTable } from "../../databases/db_objects";
import { Command, Subcommand, SubcommandGroup } from "../../lib/command";
import { PageSubsection, PageSection, CachedPage } from "../../lib/utils";

import { wikiDomain, graphQlDomain } from "../../../config.json";
import { wikiToken } from "../../../tokens.json";


interface ApiPage {
    content: string;
    title: string;
    path: string;
}

// Initialize page index
let pagesIndex;

// Emojis to use for block-quotes
const blockquoteEmojis = {
    "is-success": "✅",
    "is-info": "ℹ️",
    "is-warning": "⚠️",
    "is-danger": "❌",
};

// Split fields longer than 1024 characters into multiple fields
const splitBody = (subsections: PageSubsection[], subsection: PageSubsection, i: number): PageSubsection[] => {
    if (subsection.body && subsection.body.length > 1024) {
        const subsectionClone = {} as PageSubsection;
        Object.assign(subsectionClone, subsection);

        subsectionClone.body = subsectionClone.body.slice(0, 1013) + ".. (cont.)";
        subsections.push(subsectionClone);

        subsection.body = subsection.body.slice(1013);
        return splitBody(subsections, subsection, i + 1);
    }
    else {
        if (subsections[0] !== subsection) subsections.push(subsection);
        return subsections;
    }
};

// Parse raw page content into an array of sections, in the format of:
// [{ header: String, body: String?, image: String?, subsections: [{ header: String, body: String }...] }...]
const parsePage = (content: string, title: string, path: string): PageSection[] => {
    // If page contains HTML, a tabber element, or has a section longer than 6000 characters, return with a message about the page's complexity
    if (content.match("<h1>") || content.match("# Tabs {.tabset}") || content.split(/^#[^#]/m).find(x => x.length > 6000)) return [{
        header: title,
        body: `This page is too complex to display on Discord! Please view it [here](https://${wikiDomain}/en/${path}) instead.`,
    } as PageSection];

    // Remove links/grid-list elements
    // Add domain name to internal wiki links
    // Replace blockquote icon elements and add respective emoji
    content = content.replace(/\n{\.(?:(?:links)|(?:grid))-list}/g, "")
        .replace(/\[(.+?)\]\((.+?)\)/g, (match, x, y) => y.startsWith("/") ? "[" + x + "](https://" + wikiDomain + y + ")" : match)
        .replace(/> (.+)\n{\.(.+)}/g, (match, x, y) => "> " + blockquoteEmojis[y] + " " + x);

    // If page does not start with a header, add a header with the page's title
    if (content.match(/^[^#]/)) content = "# " + title + "\n" + content;

    // Split by h1 headers, then trim
    const sections = content.split(/^#[^#]/m);
    if (!sections[0]) sections.shift();

    // Map section text to objects
    return sections.map(x => {
        let split = x.split("\n");
        // Trim, then store first line as header
        if (!split[0]) split.shift();
        const header = split.shift();

        // Find and remove image links, storing the first one on the page
        let image ;
        split = split.filter(x => {
            const matches = x.match(/!\[.+\]\((.+?)\)/);

            if (matches && !image) image = matches[1];
            else return true;
        });

        // Split section body by h2 headers
        const subsections = split.join("\n").trim().split(/^##[^#]/m);

        // If section does not begin with subsection, store text before first subsection as section body, otherwise trim
        let body;
        if (!subsections[0]) subsections.shift();
        else body = subsections.shift()?.trim();

        // Map subsection text to objects
        let finalSubsections: PageSubsection[] = [];
        subsections.forEach(y => {
            const split = y.split("\n");
            const subsection = {
                // Store first line as header
                header: split.shift(),
                // On the remaining text re-format tables, trim, and store as subsection body
                body: split.map(z => z.replace(/\|(.+)\|/, (_, rowContent) => rowContent.split("|").join(" - "))).join("\n").trim(),
            } as PageSubsection;

            // Pass current subsection to function for splitting subsection body
            // Note that this function handles pushing the current subsection(s) to the above subsections array
            finalSubsections = splitBody(finalSubsections, subsection, 0);
        });

        // Set subsections and return
        return {
            header: header,
            image: image,
            body: body,
            subsections: finalSubsections,
        } as PageSection;
    });
};

// Convert page section object to Discord embed
const sectionToEmbed = (section) => {
    const embed = new EmbedBuilder().setTitle(section.header);
    if (section.body) embed.setDescription(section.body);
    if (section.image) embed.setImage(section.image);
    if (section.subsections) section.subsections.map(x => embed.addFields({ name: x.header, value: x.body ? x.body : "\u200b" }));

    return embed;
};

// Construct GraphQL queries
const singleQuery = (id, elements) => "{pages{single(id:" + id + "){" + elements.join(" ") + "}}}";
const listQuery = (elements) => "{pages{list{" + elements.join(" ") + "}}}";

// Fetch list of pages
const listPages = (elements) => new Promise((resolve, reject) => axios.get("https://" + graphQlDomain + "/graphql?query=" + listQuery(elements), { headers: { "Authorization": "Bearer " + wikiToken } })
    .then(res => res.data.errors ? reject("Received one or more errors:\n\t- " + res.data.errors.map(e => e.message).join("\n\t- ")) : resolve(res.data.data.pages.list))
    .catch(e => reject(e)));

// Fetch specific wiki page
const fetchPage = async (id: number, pageCache: Collection<number, CachedPage>) => {
    // Try cache first
    const page = pageCache.get(id);

    // If page exists in the cache and is less than 10 minutes old, return it, otherwise fetch page
    if (page && Date.now() - page.timestamp < 600000) return page;
    else {
        // Fetch page's title, content, and path
        const data = await axios.get(
            `https://${graphQlDomain}/graphql?query=` + singleQuery(id, ["title", "content", "path"]),
            { headers: { "Authorization": "Bearer " + wikiToken } },
        ).catch(e => { throw Error(e); });
        if (data.data.errors) throw Error("Received one or more errors:\n" + data.data.errors.map(e => e.message).join("\n"));
        const pageData = data.data.data.pages.single as ApiPage;

        // Parse page data
        const pageContent = parsePage(pageData.content, pageData.title, pageData.path);

        // Add to cache and return page data
        const cachedPage = { content: pageContent, path: pageData.path, timestamp: Date.now() };
        pageCache.set(id, cachedPage);
        return cachedPage;
    }
};

// Function to fetch page index
const fetchPageIndex = async () => pagesIndex = await listPages(["id", "title"]).catch(console.error);

// On boot fetch page index, then update it every 10 minutes
fetchPageIndex();
setInterval(fetchPageIndex, 600000);

// Shared page option for subcommands
const pageOption = (option) => option.setName("page").setDescription("Name of page to search for").setRequired(true).setAutocomplete(true);

// Functions to fetch wiki user
const fetchUser = async (id: string) => {
    const userQuery = `{users{singleByProviderId(providerId:"${id}"){id,providerId,name,providerName}}}`;
    const res = await axios.get(`https://${graphQlDomain}/graphql?query=${userQuery}`, { headers: { "Authorization": "Bearer " + wikiToken } });
    return res.data.data.users.singleByProviderId;
}

// Autocomplete
const autocompletePage = async (interaction: AutocompleteInteraction) => {
    // Return  error if no page index
    if (!pagesIndex) throw Error("Error: Page Index undefined");

    // Filter pages to match focused value
    let pages = pagesIndex.filter(p => p.title.toLowerCase().startsWith(interaction.options.getFocused()));
    // Include up to 25 pages only
    if (pages.length > 25) pages = pages.slice(0, 24);

    // Return list of matching pages
    return pages.map(p => ({ name: p.title, value: p.title }));
}

export default new Command({
    name: "wiki",
    builder: new SlashCommandBuilder().setDescription("Wiki related commands"),
    subcommandGroups: [
        new SubcommandGroup({
            name: "page",
            builder: new SlashCommandSubcommandGroupBuilder().setDescription("Fetch a wiki page"),
            subcommands: [
                new Subcommand({
                    name: "link",
                    builder: new SlashCommandSubcommandBuilder().setDescription("Fetch page link").addStringOption(pageOption),
                    execute: async (interaction) => {
                        if (!pagesIndex) throw Error("Error: Page Index undefined");
                        // Search page index and return if no page found
                        let page = pagesIndex.find(p => p.title.toLowerCase() === interaction.options.getString("page", true).toLowerCase());
                        if (!page) {
                            interaction.reply({ content: "No page found.", flags: MessageFlags.Ephemeral });
                            return;
                        }

                        // Fetch page
                        const pageId = page.id;
                        page = await fetchPage(pageId, interaction.client.pageCache);
                        if (!page) return;

                        // Send reply
                        interaction.reply("https://" + wikiDomain + "/en/" + page.path);
                    },
                    autocomplete: autocompletePage,
                }),
                new Subcommand({
                    name: "content",
                    builder: new SlashCommandSubcommandBuilder().setDescription("Fetch page content").addStringOption(pageOption),
                    execute: async (interaction) => {
                        if (!pagesIndex) throw Error("Error: Page Index undefined");
                        // Search page index and return if no page found
                        let page = pagesIndex.find(p => p.title.toLowerCase() === interaction.options.getString("page", true).toLowerCase());
                        if (!page) {
                            interaction.reply({ content: "No page found.", flags: MessageFlags.Ephemeral });
                            return;
                        }

                        // Fetch page
                        const pageId = page.id;
                        page = await fetchPage(pageId, interaction.client.pageCache);

                        // Construct embed
                        const toSend: InteractionReplyOptions = { embeds: [sectionToEmbed(page.content[0])] };
                        // If page has multiple sections, add buttons to tab through sections
                        if (page.content.length > 1) toSend.components = [new ActionRowBuilder<ButtonBuilder>().addComponents(
                            interaction.client.createButton("pageBack", pageId).setDisabled(true),
                            interaction.client.createButton("pageForward", pageId),
                        )];

                        // Send reply
                        interaction.reply(toSend);
                    },
                    autocomplete: autocompletePage,
                }),
            ],
        }),
    ],
    subcommands: [
        new Subcommand({
            name: "verify",
            builder: new SlashCommandSubcommandBuilder().setDescription("Verify your wiki account"),
            execute: async (interaction) => {
                if (!interaction.inCachedGuild()) {
                    interaction.reply({ content: "That command can't be used in DMs.", flags: MessageFlags.Ephemeral });
                    return;
                }
                await interaction.guild.roles.fetch();

                const contributorRole = await BotConfigTable.findOne({ where: { id: "contributorRole", guild: interaction.guild.id } }).then(x => x?.get("value"));
                if (!contributorRole) throw Error("No wiki contributor role configured.")

                if (interaction.member.roles.cache.has(contributorRole)) {
                    interaction.reply({ content: "You already have the contributor role.", flags: MessageFlags.Ephemeral });
                    return;
                }

                const user = await fetchUser(interaction.user.id);
                if (!user) {
                    interaction.reply({ content: "No user found.", flags: MessageFlags.Ephemeral })
                    return;
                }

                await interaction.member.roles.add(contributorRole);
                interaction.reply("User found. Contributor role successfully added.");
            }
        }),
    ],
});
