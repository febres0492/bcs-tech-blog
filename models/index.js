const User = require('./User')
const Token = require('./token');
// const BlogPost = require('./BlogPost')

User.hasOne(Token,{foreignKey:'email', onDelete:'CASCADE'})
Token.belongsTo(User, {foreignKey:'email'})

module.exports = { User, BlogPost, Token }