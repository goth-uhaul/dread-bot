const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const { wikiDomain } = require ('../config.json');
const { wikiToken } = require('../tokens.json');

const singleQuery = (id, elements) => '{pages{single(id:' + id + '){' + elements.join(' ') + '}}}';
const listQuery = (elements) => '{pages{list{' + elements.join(' ') + '}}}';

const fetchPage = (id, elements) => new Promise((resolve) => axios.get('http://' + wikiDomain + '/graphql?query=' + singleQuery(id, elements), { headers: { 'Authorization': 'Bearer ' + wikiToken } }).then(res => resolve(res.data.data.pages.single)));
const listPages = (elements) => new Promise((resolve) => axios.get('http://' + wikiDomain + '/graphql?query=' + listQuery(elements), { headers: { 'Authorization': 'Bearer ' + wikiToken } }).then(res => resolve(res.data.data.pages.list)));

let pagesIndex;
const fetchPages = async () => pagesIndex = await listPages(['id', 'title']);
fetchPages();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('page')
        .setDescription('Grabs a wiki page')
        .addStringOption(option =>
            option.setName('page')
                .setDescription('Name of page to search for')
                .setRequired(true)),
    execute(interaction) {
        return new Promise(async (resolve, reject) => {
            let page = pagesIndex.find(p => p.title === interaction.options.getString('page'));
            if (!page) interaction.reply('No page found!').then(resolve()).catch(e => reject(e));

            page = await fetchPage(page.id, ['content']);
            interaction.reply(page.content).then(resolve()).catch(e => reject(e));
        });
    }
};
