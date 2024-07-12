const router = require('express').Router();
const { Op } = require('sequelize');
const { User, BlogPost, Comments } = require('../../models');
const c = require('../../utils/helpers').c
const whenLoggedIn = require('../../utils/auth').whenLoggedIn

// get all blog posts
router.get('/', async (req, res) => {
    try {

        const getUserBlogs = req.query.getUserBlogs === 'true';

        if (getUserBlogs && req.session.logged_in) {
            const blogData = await BlogPost.findAll({
                where: { authorId: req.session.user_id },
                include: [
                    { model: User, attributes: ['name'] },
                    { model: Comments, attributes: [ 'commentCreatorId', 'commentCreatorName', 'blogPostId', 'blogPostCreatorId', 'commentText', 'id', 'createdAt', 'updatedAt'], }
                ]
            });
            return res.status(200).json(blogData);
        }

        const blogData = await BlogPost.findAll({
            include: [
                { model: User, attributes: ['name'] },
                { model: Comments, attributes: [ 'commentCreatorId', 'commentCreatorName', 'blogPostId', 'blogPostCreatorId', 'commentText', 'id', 'createdAt', 'updatedAt'], }
            ]
        });
        res.status(200).json(blogData);
    } catch (err) {
        console.log(c('err','r'), err)
        res.status(500).json(err);
    }
})

// create a new blog post
router.post('/create/', whenLoggedIn, async (req, res) => {
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

// get a blog post by id
router.get('/id/:id', async (req, res) => {
    try {
        const blogData = await BlogPost.findByPk(req.params.id, {
            include: [
                { model: User, attributes: ['name'] },
                { model: Comments, attributes: [ 'commentCreatorId', 'commentCreatorName', 'blogPostId', 'blogPostCreatorId', 'commentText', 'id', 'createdAt', 'updatedAt'], }
            ]
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

// edit a blog post
router.put('/id/:id', whenLoggedIn, async (req, res) => {
    console.log(c('edit a blog post','r'), req.session.user_id, req.body, req.params)
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

        // returning the updated blog post
        const updatedBlogPost = await BlogPost.findByPk(req.params.id, {
            include: [
                { model: User, attributes: ['name'] },
                { model: Comments, attributes: [ 'commentCreatorId', 'commentCreatorName', 'blogPostId', 'blogPostCreatorId', 'commentText', 'id', 'createdAt', 'updatedAt'], }
            ]
        } )

        console.log(c('blogdata','y'), blogData)
        console.log(c('updatedBlogPost','y'), updatedBlogPost)

        res.status(200).json(updatedBlogPost)

    } catch (err) {
        console.log('Error:', err)
        res.status(500).json(err)
    }
});

// delete a blog post
router.delete('/id/:id', whenLoggedIn, async (req, res) => {
    console.log(c('delete a blog post','r'), req.session.user_id, req.params)
    try {
        const blogData = await BlogPost.destroy({
            where: {
                id: req.params.id,
                authorId: req.session.user_id
            }
        })
        if (!blogData) {
            return res.status(404).json({ message: 'No blog post found with this id!' })
        }
        res.status(200).json({ message: 'Blog post deleted!', blogData})
    } catch (err) {
        console.log('Error:', err)
        res.status(500).json(err)
    }
});

// search for blog posts
router.get('/search/:search', async (req, res) => {
    console.log(c('search for blog posts','r'), req.params)
    try {
        const blogData = await BlogPost.findAll({
            where: {
                [Op.or]: [
                    { title: { [Op.iLike]: `%${req.params.search}%` } },
                    { content: { [Op.iLike]: `%${req.params.search}%` } },
                ]
            },
            include: [
                { model: User, attributes: ['name'] },
                { model: Comments, attributes: [ 'commentCreatorId', 'commentCreatorName', 'blogPostId', 'blogPostCreatorId', 'commentText', 'id', 'createdAt', 'updatedAt'], }
            ]
        })

        res.status(200).json(blogData)
    } catch (err) {
        console.log('Error:', err)
        res.status(500).json(err)
    }
})

module.exports = router;
