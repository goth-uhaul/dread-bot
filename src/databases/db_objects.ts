import { Sequelize } from "sequelize";

import { createBotConfigModel, createStreamBlacklistModel } from "./db_models";


// Initialize sequelize
const sequelize = new Sequelize("database", "user", "password", {
    host: "localhost",
    dialect: "sqlite",
    logging: false,
    storage: "database.sqlite"
});

// Models
export const BotConfigTable = createBotConfigModel(sequelize);
export const StreamBlacklistTable = createStreamBlacklistModel(sequelize);
