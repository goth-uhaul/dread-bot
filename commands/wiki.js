const axios = require('axios');
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, Collection, SlashCommandSubcommandGroupBuilder, SlashCommandSubcommandBuilder } = require('discord.js');
const { wikiDomain, graphQlDomain, contributorRole } = require ('../config.json');
const { wikiToken } = require('../tokens.json');

// Initialize page index
let pagesIndex;

// Emojis to use for block-quotes
const blockquoteEmojis = {
    'is-success': '✅',
    'is-info': 'ℹ️',
    'is-warning': '⚠️',
    'is-danger': '❌',
};

// Split fields longer than 1024 characters into multiple fields
const splitBody = (subsections, subsection, i) => {
    if (subsection.body && subsection.body.length > 1024) {
        const subsectionClone = {};
        Object.assign(subsectionClone, subsection);

        subsectionClone.body = subsectionClone.body.slice(0, 1013) + '.. (cont.)';
        subsections.push(subsectionClone);

        subsection.body = subsection.body.slice(1013);
        return splitBody(subsections, subsection, i + 1);
    }
    else {
        if (subsections[0] !== subsection) subsections.push(subsection);
        return subsections;
    }
}

// Parse raw page content into an array of sections, in the format of:
// [{ header: String, body: String?, image: String?, subsections: [{ header: String, body: String }...] }...]
const parsePage = (content, title, path) => {
    // If page contains HTML, a tabber element, or has a section longer than 6000 characters, return with a message about the page's complexity
    if (content.match('<h1>') || content.match('# Tabs {.tabset}') || content.split(/^#[^#]/m).find(x => x.length > 6000)) return [{ header: title, body: 'This page is too complex to display on Discord! Please view it [here](https://' + wikiDomain + '/en/' + path + ') instead.'}];

    // Remove links/grid-list elements
    // Add domain name to internal wiki links
    // Replace blockquote icon elements and add respective emoji
    content = content.replace(/\n{\.(?:(?:links)|(?:grid))-list}/g, '')
        .replace(/\[(.+?)\]\((.+?)\)/g, (match, x, y) => y.startsWith('/') ? '[' + x + '](https://' + wikiDomain + y + ')' : match)
        .replace(/> (.+)\n{\.(.+)}/g, (match, x, y) => '> ' + blockquoteEmojis[y] + ' ' + x);

    // If page does not start with a header, add a header with the page's title
    if (content.match(/^[^#]/)) content = '# ' + title + '\n' + content;

    // Split by h1 headers, then trim
    let sections = content.split(/^#[^#]/m);
    if (!sections[0]) sections.shift();

    // Map section text to objects
    sections = sections.map(x => {
        let split = x.split('\n');
        const section = {};

        // Trim, then store first line as header
        if (!split[0]) split.shift();
        section.header = split.shift();

        // Find and remove image links, storing the first one on the page
        split = split.filter(x => {
            const matches = x.match(/!\[.+\]\((.+?)\)/);

            if (matches && !section.image) section.image = matches[1]
            else return true;
        });

        // Split section body by h2 headers
        section.subsections = split.join('\n').trim().split(/^##[^#]/m);

        // If section does not begin with subsection, store text before first subsection as section body, otherwise trim
        if (!section.subsections[0]) section.subsections.shift();
        else section.body = section.subsections.shift().trim();

        // Map subsection text to objects
        let subsections = [];
        section.subsections.forEach(y => {
            const split = y.split('\n');
            const subsection = {};

            // Store first line as header
            subsection.header = split.shift();
            // On the remaining text re-format tables, trim, and store as subsection body
            subsection.body = split.map(z => z.replace(/\|(.+)\|/, (match, rowContent) => rowContent.split('|').join(' - '))).join('\n').trim();

            // Pass current subsection to function for splitting subsection body
            // Note that this function handles pushing the current subsection(s) to the above subsections array
            subsections = splitBody(subsections, subsection, 0);
        });

        // Set subsections and return
        section.subsections = subsections;
        return section;
    });

    return sections;
}

// Convert page section object to Discord embed
const sectionToEmbed = (section) => {
    const embed = new EmbedBuilder().setTitle(section.header);
    if (section.body) embed.setDescription(section.body);
    if (section.image) embed.setImage(section.image);
    if (section.subsections) section.subsections.map(x => embed.addFields({ name: x.header, value: x.body ? x.body : '\u200b' }));

    return embed;
}

// Construct GraphQL queries
const singleQuery = (id, elements) => '{pages{single(id:' + id + '){' + elements.join(' ') + '}}}';
const listQuery = (elements) => '{pages{list{' + elements.join(' ') + '}}}';

// Fetch list of pages
const listPages = (elements) => new Promise((resolve, reject) => axios.get('http://' + graphQlDomain + '/graphql?query=' + listQuery(elements), { headers: { 'Authorization': 'Bearer ' + wikiToken } })
    .then(res => res.data.errors ? reject('Received one or more errors:\n\t- ' + res.data.errors.map(e => e.message).join('\n\t- ')) : resolve(res.data.data.pages.list))
    .catch(e => reject(e)));

// Fetch specific wiki page
const fetchPage = (id) => new Promise(async (resolve, reject) => {
    // Try cache first
    const page = client.pageCache.get(id);

    // If page exists in the cache and is less than 10 minutes old, return it, otherwise fetch page
    if (page && Date.now() - page.timestamp < 600000) return resolve(page);
    else {
        // Fetch page's title, content, and path
        let data = await axios.get('http://' + graphQlDomain + '/graphql?query=' + singleQuery(id, ['title', 'content', 'path']), { headers: { 'Authorization': 'Bearer ' + wikiToken } }).catch(e => reject(e));
        if (data.data.errors) return reject('Received one or more errors:\n' + data.data.errors.map(e => e.message).join('\n'));
        data = data.data.data.pages.single;

        // Parse page data
        const pageContent = parsePage(data.content, data.title, data.path);

        // Add to cache and return page data
        const pageData = { content: pageContent, path: data.path, timestamp: Date.now() }
        client.pageCache.set(id, pageData);
        return resolve(pageData);
    }
});

// Function to fetch page index
const fetchPageIndex = async () => pagesIndex = await listPages(['id', 'title']).catch(console.error);

// On boot fetch page index, then update it every 10 minutes
fetchPageIndex();
setInterval(fetchPageIndex, 600000);

// Shared page option for subcommands
const pageOption = (option) => option.setName('page').setDescription('Name of page to search for').setRequired(true).setAutocomplete(true);

// Functions to fetch wiki user
const userQuery = (id) => '{users{singleByProviderId(providerId:"' + id + '"){id,providerId,name,providerName}}}'
const fetchUser = (id) => new Promise((resolve) => axios.get('http://' + graphQlDomain + '/graphql?query=' + userQuery(id), { headers: { 'Authorization': 'Bearer ' + wikiToken } }).then(res => resolve(res.data.data.users.singleByProviderId)));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wiki')
        .setDescription('Wiki related commands'),
    component: 'wiki',
    subcommandGroups: new Collection([
        ['page', {
            data: new SlashCommandSubcommandGroupBuilder()
                .setName('page')
                .setDescription('Fetch a wiki page'),
            component: 'wiki',
            subcommands: new Collection([
                ['link', {
                    data: new SlashCommandSubcommandBuilder()
                        .setName('link')
                        .setDescription('Fetch page link')
                        .addStringOption(pageOption),
                    component: 'wiki',
                    execute(interaction) {
                        return new Promise(async (resolve, reject) => {
                            if (!pagesIndex) return reject('Error: Page Index undefined');
                            // Search page index and return if no page found
                            let page = pagesIndex.find(p => p.title.toLowerCase() === interaction.options.getString('page').toLowerCase());
                            if (!page) return interaction.reply({ content: 'No page found!', ephemeral: true }).then(resolve()).catch(e => reject(e));

                            // Fetch page
                            const pageId = page.id;
                            page = await fetchPage(pageId).catch(e => reject(e));
                            if (!page) return;

                            // Send reply
                            interaction.reply('https://' + wikiDomain + '/en/' + page.path).then(resolve()).catch(e => reject(e));
                        });
                    },
                    autocomplete(interaction) {
                        return new Promise((resolve, reject) => {
                            // Return  error if no page index
                            if (!pagesIndex) return reject('Error: Page Index undefined');

                            // Filter pages to match focused value
                            let pages = pagesIndex.filter(p => p.title.toLowerCase().startsWith(interaction.options.getFocused()));
                            // Include up to 25 pages only
                            if (pages.length > 25) pages = pages.slice(0, 24);

                            // Return list of matching pages
                            interaction.respond(pages.map(p => { return { name: p.title, value: p.title } })).then(resolve()).catch(e => reject(e));
                        });
                    }
                }],
                ['content', {
                    data: new SlashCommandSubcommandBuilder()
                        .setName('content')
                        .setDescription('Fetch page content')
                        .addStringOption(pageOption),
                    component: 'wiki',
                    execute(interaction) {
                        return new Promise(async (resolve, reject) => {
                            if (!pagesIndex) return reject('Error: Page Index undefined');
                            // Search page index and return if no page found
                            let page = pagesIndex.find(p => p.title.toLowerCase() === interaction.options.getString('page').toLowerCase());
                            if (!page) return interaction.reply({ content: 'No page found!', ephemeral: true }).then(resolve()).catch(e => reject(e));

                            // Fetch page
                            const pageId = page.id;
                            page = await fetchPage(pageId).catch(e => reject(e));

                            // Construct embed
                            const toSend = { embeds: [sectionToEmbed(page.content[0])] };
                            // If page has multiple sections, add buttons to tab through sections
                            if (page.content.length > 1) toSend.components = [new ActionRowBuilder().addComponents(client.buttons.get('pageBack').button(pageId).setDisabled(true), client.buttons.get('pageForward').button(pageId))];

                            // Send reply
                            interaction.reply(toSend).then(resolve()).catch(e => reject(e));
                        });
                    },
                    autocomplete(interaction) {
                        return new Promise((resolve, reject) => {
                            // Return  error if no page index
                            if (!pagesIndex) return reject('Error: Page Index undefined');

                            // Filter pages to match focused value
                            let pages = pagesIndex.filter(p => p.title.toLowerCase().startsWith(interaction.options.getFocused()));
                            // Include up to 25 pages only
                            if (pages.length > 25) pages = pages.slice(0, 24);

                            // Return list of matching pages
                            interaction.respond(pages.map(p => { return { name: p.title, value: p.title } })).then(resolve()).catch(e => reject(e));
                        });
                    }
                }]
            ])
        }]
    ]),
    subcommands: new Collection([
        ['verify', {
            data: (sc) =>
                sc.setName('verify')
                .setDescription('Verify your wiki account'),
            component: 'wiki',
            execute(interaction) {
                return new Promise(async (resolve, reject) => {
                    await interaction.guild.roles.fetch();
                    if (interaction.member.roles.cache.has(contributorRole)) return interaction.reply({ content: 'You already have the contributor role!', ephemeral: true }).then(resolve()).catch(e => reject(e));

                    const user = await fetchUser(interaction.user.id);
                    if (!user) return interaction.reply({ content: 'No user found!', ephemeral: true }).then(resolve()).catch(e => reject(e));

                    await interaction.member.roles.add(contributorRole).catch(e => reject(e));
                    interaction.reply('User found! You should now have the contributor role.').then(resolve()).catch(e => reject(e));
                });
            }
        }]
    ])
};
