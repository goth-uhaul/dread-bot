module.exports = {
    model: (sequelize, DataTypes) => sequelize.define('streamBlacklist', {
        userId: {
            type: DataTypes.STRING,
            unique: true
        }
    }),
    component: 'streams'
};
