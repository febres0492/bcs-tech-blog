const router = require('express').Router();
const { Comments } = require('../../models');
const c = require('../../utils/helpers').c
const whenLoggedIn = require('../../utils/auth').whenLoggedIn

// comment on a blog post
router.post('/', whenLoggedIn, async (req, res) => {
    console.log(c('comment on a blog post','r'), req.session.user_id, req.body, req.params)
    try {
        console.log(c('req.body','y'), req.body)
        req.body.commentCreatorId = req.session.user_id
        req.body.commentCreatorName = req.session.currUser.name

        const comment = await Comments.create({ ...req.body })

        res.status(200).json(comment)
        
    } catch (err) {
        console.log('Error:', err)
        res.status(500).json(err)
    }
});

// edit a comment by id
router.put('/:id', whenLoggedIn, async (req, res) => {
    console.log(c('edit a comment by id','r'), req.session.user_id, req.body, req.params)
    try {

        const comment = await Comments.findByPk(req.params.id)

        const isCommentCreator = comment.commentCreatorId == req.session.user_id
        const isBlogPostCreator = comment.blogPostCreatorId == req.session.user_id

        if (!isCommentCreator && !isBlogPostCreator) {
            return res.status(401).json({ message: 'Unauthorized access' })
        }

        if (!comment) {
            return res.status(401).json({ message: 'No comment found with this id!' })
        }

        await Comments.update(req.body, { where: { id: req.params.id, } })

        // getting the updated comment
        const updatedComment = await Comments.findByPk(req.params.id)

        res.status(200).json(updatedComment)

    } catch (err) {
        console.log('Error:', err)
        res.status(500).json(err)
    }
});

// delete a comment by id
router.delete('/:id', whenLoggedIn, async (req, res) => {
    console.log(c('delete a comment by id','r'), req.session.user_id, req.params)
    try {

        const comment = await Comments.findByPk(req.params.id)
        console.log(c('comment','y'),comment.commentCreatorId == req.session.user_id, comment.commentCreatorId, req.session.user_id)

        const isCommentCreator = comment.commentCreatorId == req.session.user_id
        const isBlogPostCreator = comment.blogPostCreatorId == req.session.user_id

        if (!isCommentCreator && !isBlogPostCreator) {
            return res.status(401).json({ message: 'Unauthorized access' })
        }

        const commentData = await Comments.destroy({
            where: { id: req.params.id, }
        })

        if (!commentData) {
            return res.status(401).json({ message: 'No comment found with this id!' })
        }

        res.status(200).json(commentData)
    } catch (err) {
        console.log('Error:', err)
        res.status(500).json(err)
    }
});


module.exports = router;