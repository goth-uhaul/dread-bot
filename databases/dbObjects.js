const Sequelize = require('sequelize');
const fs = require('fs');
const path = require('path');
const { enabledComponents } = require('../config.json');

// Initialize sequelize
let sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite'
});

// Import models
fs.readdirSync(path.resolve(__dirname, './models')).forEach(file => {
	const model = require('./models/' + file);
	if (enabledComponents.includes(model.component)) exports[file.slice(0, -3)] = model.model(sequelize, Sequelize.DataTypes);
});
