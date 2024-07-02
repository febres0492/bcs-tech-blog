const router = require('express').Router();
const { User, BlogPost } = require('../../models');
const c = require('../../utils/helpers').c

// get all blog posts
router.get('/', async (req, res) => {
    try {
        const blogData = await BlogPost.findAll({
            include: [
                {
                    model: User,
                    attributes: ['name']
                }
            ]
        });
        res.status(200).json(blogData);
    } catch (err) {
        console.log(c('err','r'), err)
        res.status(500).json(err);
    }
})

// create a new blog post
router.post('/', async (req, res) => {
    console.log(c('create a new blog post','r'), req.session.user_id, req.body, )
    try {
        const newBlogPost = await BlogPost.create({
            ...req.body,
            authorId: req.session.user_id 
        })
        res.status(200).json(newBlogPost)
    } catch (err) {
        console.log('Error:', err)
        res.status(400).json(err)
    }
});

module.exports = router;
