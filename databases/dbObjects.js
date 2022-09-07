const Sequelize = require('sequelize');
const fs = require('fs');
const path = require('path');

// Initialize sequelize
let sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite'
});

fs.readdirSync(path.resolve(__dirname, './models')).map(file => exports[file.slice(0, -3)] = require('./models/' + file)(sequelize, Sequelize.DataTypes));
