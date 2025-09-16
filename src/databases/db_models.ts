import { DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from "sequelize";


export class BotConfig extends Model<InferAttributes<BotConfig>, InferCreationAttributes<BotConfig>> {
    declare id: string
    declare value: string
    declare guild: string | null
}

export const createBotConfigModel = (sequelize: Sequelize) => BotConfig.init(
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        value: DataTypes.STRING,
        guild: DataTypes.STRING,
    },
    {
        sequelize,
        tableName: "botConfig",
    },
);

export class StreamBlacklist extends Model<InferAttributes<StreamBlacklist>, InferCreationAttributes<StreamBlacklist>> {
    declare userId: string
}

export const createStreamBlacklistModel = (sequelize: Sequelize) => StreamBlacklist.init(
    {
        userId: {
            type: DataTypes.STRING,
            unique: true,
        },
    },
    {
        sequelize,
        tableName: "streamBlacklist",
    },
);
