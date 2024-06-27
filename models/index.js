const User = require('./User')
const Token = require('./token');

User.hasOne(Token,{foreignKey:'email', onDelete:'CASCADE'})
Token.belongsTo(User, {foreignKey:'email'})

module.exports = {
    User,
    Token
}