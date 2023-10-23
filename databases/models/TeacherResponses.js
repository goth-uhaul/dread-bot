module.exports = {
    model: (sequelize, DataTypes) => {
        return sequelize.define('teacherResponses', {
            userId: {
                type: DataTypes.STRING,
                unique: true
            },
            discordName: DataTypes.STRING,
            srcName: DataTypes.STRING,
            positions: DataTypes.STRING,
            timeRunning: DataTypes.STRING,
            hardware: DataTypes.STRING,
            strength: DataTypes.TEXT,
            weakness: DataTypes.TEXT,
            backupStrats: DataTypes.TEXT,
            otherStrats: DataTypes.TEXT,
            comments: DataTypes.TEXT,
            upvotes: DataTypes.TEXT,
            downvotes: DataTypes.TEXT,
            status: DataTypes.STRING
        });
    },
    component: 'bootcamp'
};
