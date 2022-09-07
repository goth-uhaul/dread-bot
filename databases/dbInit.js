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

const models = fs.readdirSync(path.resolve(__dirname, './models')).map(file => require('./models/' + file)(sequelize, Sequelize.DataTypes));

// Force sync command line option
const force = process.argv.includes('--force') || process.argv.includes('-f');

sequelize.sync({ force }).then(() => {
	console.log('Database synced!');
	console.log(models);

	sequelize.close();
}).catch(console.error);
