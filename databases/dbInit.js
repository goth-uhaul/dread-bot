const Sequelize = require('sequelize');
const fs = require('fs');
const path = require('path');
const { enabledComponents } = require('../config.json');

// Initialize sequelize
const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite'
});

// Import models
const models = fs.readdirSync(path.resolve(__dirname, './models'))
	.map(file => {
		const model = require('./models/' + file);
		if (enabledComponents.includes(model.component)) return model.model(sequelize, Sequelize.DataTypes);
	})
	.filter(file => !!file);

// Force sync command line option
const force = process.argv.includes('--force') || process.argv.includes('-f');

sequelize.sync({ force }).then(() => {
	console.log('Database synced!');
	console.log(models);

	sequelize.close();
}).catch(console.error);
