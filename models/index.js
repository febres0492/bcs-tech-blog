const User = require('./User')
const Token = require('./token');
const BlogPost = require('./blogPost')

User.hasOne(Token,{foreignKey:'email', onDelete:'CASCADE'})
Token.belongsTo(User, {foreignKey:'email'})

User.hasMany(BlogPost, {foreignKey: 'user_id', onDelete: 'CASCADE'})
BlogPost.belongsTo(User, {foreignKey: 'user_id'})

module.exports = { User, BlogPost, Token }