const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

class Token extends Model { }

Token.init({
    user_email:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        }
    },
    token: {
        type: DataTypes.STRING,
        allowNull:false,
        unique:true,
    }
},
{
    sequelize,
    timestamps: false,
    freezeTableName: true,
    underscored: true,
    modelName: 'blog_token',
}
)

module.exports = Token;