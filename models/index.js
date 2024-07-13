const User = require('./User');
const Token = require('./Token');
const BlogPost = require('./BlogPost');
const Comments = require('./Comments');

// User-Token relationship
User.hasOne(Token, { foreignKey: 'email', onDelete: 'CASCADE' });
Token.belongsTo(User, { foreignKey: 'email' });

// User-BlogPost relationship
User.hasMany(BlogPost, { foreignKey: 'user_id', onDelete: 'CASCADE' });
BlogPost.belongsTo(User, { foreignKey: 'user_id' });

// User-Comment relationship
User.hasMany(Comments, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Comments.belongsTo(User, { foreignKey: 'user_id' });

// BlogPost-Comments relationship
BlogPost.hasMany(Comments, { foreignKey: 'blogPost_id', onDelete: 'CASCADE' });
Comments.belongsTo(BlogPost, { foreignKey: 'blogPost_id' });

module.exports = { User, BlogPost, Token, Comments };
