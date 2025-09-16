import { Sequelize } from "sequelize";

import { createBotConfigModel, createStreamBlacklistModel } from "./db_models";


// Initialize sequelize
const sequelize = new Sequelize("database", "user", "password", {
    host: "localhost",
    dialect: "sqlite",
    logging: false,
    storage: "database.sqlite"
});

// Import models
createBotConfigModel(sequelize);
createStreamBlacklistModel(sequelize);

// Force sync command line option
const force = process.argv.includes("--force") || process.argv.includes("-f");

sequelize.sync({ force }).then(async () => {
    console.log("Database synced.");

    sequelize.close();
}).catch(console.error);
