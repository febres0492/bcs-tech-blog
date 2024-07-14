const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

class Comment extends Model {}

Comment.init(
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        commentText: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        commentCreatorId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        commentCreatorName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        blogPostId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        blogPostCreatorId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        timestamps: true,
        freezeTableName: true,
        underscored: true,
        modelName: 'blog_comments',
    }
);

module.exports = Comment;
