const axios = require('axios');
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder } = require('discord.js');
const { wikiDomain, graphQlDomain } = require ('../config.json');
const { wikiToken } = require('../tokens.json');

let pagesIndex;

const blockquoteEmojis = {
    'is-success': '✅',
    'is-info': 'ℹ️',
    'is-warning': '⚠️',
    'is-danger': '❌',
};

const splitBody = (subsections, subsection, i) => {
    if (subsection.body && subsection.body.length > 1024) {
        let subsectionClone = {};
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

const parsePage = (content, title, path) => {
    if (content.match('<h1>') || content.match('# Tabs {.tabset}') || content.split(/^#[^#]/m).find(x => x.length > 6000)) return [{ header: title, body: 'This page is too complex to display on Discord! Please view it [here](https://' + wikiDomain + '/en/' + path + ') instead.'}];

    content = content.replace(/\n{\.(?:(?:links)|(?:grid))-list}/g, '')
        .replace(/\[(.+?)\]\((.+?)\)/g, (match, x, y) => y.startsWith('/') ? '[' + x + '](https://' + wikiDomain + y + ')' : match)
        .replace(/> (.+)\n{\.(.+)}/g, (match, x, y) => '> ' + blockquoteEmojis[y] + ' ' + x);

    if (content.match(/^[^#]/)) content = '# ' + title + '\n' + content;
    let sections = content.split(/^#[^#]/m);
    if (!sections[0]) sections.shift();

    sections = sections.map(x => {
        let split = x.split('\n');
        let section = {};

        if (!split[0]) split.shift();
        section.header = split.shift();

        split = split.filter(x => {
            const matches = x.match(/!\[.+\]\((.+?)\)/);

            if (matches && !section.image) section.image = matches[1]
            else return true;
        });

        section.subsections = split.join('\n').trim().split(/^##[^#]/m);
        if (!section.subsections[0]) section.subsections.shift();
        else section.body = section.subsections.shift().trim();

        let subsections = [];
        section.subsections.forEach(y => {
            let split = y.split('\n');
            let subsection = {};

            subsection.header = split.shift();
            subsection.body = split.map(z => z.replace(/\|(.+)\|/, (match, rowContent) => rowContent.split('|').join(' - '))).join('\n').trim();

            subsections = splitBody(subsections, subsection, 0);
        });

        section.subsections = subsections;

        return section;
    });

    return sections;
}

const sectionToEmbed = (section) => {
    let embed = new EmbedBuilder().setTitle(section.header);
    if (section.body) embed.setDescription(section.body);
    if (section.image) embed.setImage(section.image);
    if (section.subsections) section.subsections.map(x => embed.addFields({ name: x.header, value: x.body ? x.body : '\u200b' }));

    return embed;
}

const singleQuery = (id, elements) => '{pages{single(id:' + id + '){' + elements.join(' ') + '}}}';
const listQuery = (elements) => '{pages{list{' + elements.join(' ') + '}}}';
const listPages = (elements) => new Promise((resolve) => axios.get('http://' + graphQlDomain + '/graphql?query=' + listQuery(elements), { headers: { 'Authorization': 'Bearer ' + wikiToken } }).then(res => resolve(res.data.data.pages.list)));

const fetchPage = (id) => new Promise(async (resolve, reject) => {
    let page = client.pageCache.get(id);
    if (page && Date.now() - page.timestamp < 600000) return resolve(page.data);
    else {
        let data = await axios.get('http://' + graphQlDomain + '/graphql?query=' + singleQuery(id, ['title', 'content', 'path']), { headers: { 'Authorization': 'Bearer ' + wikiToken } }).catch(e => reject(e));

        const title = data.data.data.pages.single.title;
        const path = data.data.data.pages.single.path;
        data = data.data.data.pages.single.content;

        const pageData = parsePage(data, title, path);

        client.pageCache.set(id, { data: pageData, timestamp: Date.now() });
        return resolve(pageData);
    }
});

const fetchPages = async () => pagesIndex = await listPages(['id', 'title']);

fetchPages();
setInterval(fetchPages, 600000);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('page')
        .setDescription('Grabs a wiki page')
        .addStringOption(option =>
            option.setName('page')
                .setDescription('Name of page to search for')
                .setRequired(true)),
    component: 'wiki',
    execute(interaction) {
        return new Promise(async (resolve, reject) => {
            let page = pagesIndex.find(p => p.title.toLowerCase() === interaction.options.getString('page').toLowerCase());
            if (!page) return interaction.reply('No page found!').then(resolve()).catch(e => reject(e));

            let pageId = page.id;
            page = await fetchPage(pageId);

            let toSend = { embeds: [sectionToEmbed(page[0])] };
            if (page.length > 1) toSend.components = [new ActionRowBuilder().addComponents(client.buttons.get('pageBack').button(pageId).setDisabled(true), client.buttons.get('pageForward').button(pageId))];

            interaction.reply(toSend).then(resolve()).catch(e => reject(e));
        });
    }
};
