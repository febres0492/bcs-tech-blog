const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = require('../config/connection');

class User extends Model {
    checkPassword(loginPw) {
        return bcrypt.compareSync(loginPw, this.password);
    }
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: { args:[8],
                    msg:"Password must be at least 8 characters long"
                },
                // customsecurecheck(value) {
                //     if (!/[A-Z]/.test(value)) {
                //       throw new Error('Password must contain at least one uppercase letter');
                //     }
                //     if (!/[a-z]/.test(value)) {
                //       throw new Error('Password must contain at least one lowercase letter');
                //     }
                //     if (!/[^A-Za-z0-9]/.test(value)) {
                //       throw new Error('Password must contain at least one special character');
                //     }
                //     if (!/[0-9]/.test(value)) {
                //         throw new Error('Password must contain at least one number');
                //       }
                //   },
            },
        },
    },
    {
        hooks: {
            beforeCreate: async (newUserData) => {
                newUserData.password = await bcrypt.hash(newUserData.password, 10);
                return newUserData;
            },
            beforeUpdate: async (updatedUserData) => {
                updatedUserData.password = await bcrypt.hash(updatedUserData.password, 10);
                return updatedUserData
            }
        },
        sequelize,
        timestamps: false,
        freezeTableName: true,
        underscored: true,
        modelName: 'user',
    }
);

module.exports = User;
