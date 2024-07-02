const router = require('express').Router();
const { User, BlogPost } = require('../../models');
const c = require('../../utils/helpers').c
const whenLoggedIn = require('../../utils/auth').whenLoggedIn

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
router.post('/', whenLoggedIn, async (req, res) => {
    console.log(c('create a new blog post','r'), req.session.user_id, req.body, )
    try {
        const newBlogPost = await BlogPost.create({
            ...req.body,
            authorId: req.session.user_id,
            authorName: req.session.currUser.name
        })
        res.status(200).json(newBlogPost)
    } catch (err) {
        console.log('Error:', err)
        res.status(400).json(err)
    }
});

// edit a blog post
router.put('/:id', whenLoggedIn, async (req, res) => {
    try {
        const blogData = await BlogPost.update(req.body, {
            where: {
                id: req.params.id,
                authorId: req.session.user_id
            }
        })
        if (!blogData) {
            return res.status(404).json({ message: 'No blog post found with this id!' })
        }
        res.status(200).json(blogData)
    } catch (err) {
        console.log('Error:', err)
        res.status(500).json(err)
    }
});

module.exports = router;
