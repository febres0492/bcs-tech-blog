const router = require('express').Router();
const { User, Token } = require('../models');
const withAuth = require('../utils/auth');
const { c, listHandlebarsFiles } = require('../utils/helpers');


// favicon.ico requests
router.get('/favicon.ico', (req, res) => res.status(204));

// Main page route
router.get('/', async (req, res) => {
    console.log(c('main page ', 'r'));
    try {
        const obj = {
            homePage: true,
            logged_in: req.session?.logged_in,
            user_id: req.session?.user_id,
            currUser: req.session?.currUser,
        }
        console.log(c('obj:', 'y'), obj);
        res.render('homepage', obj);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Dynamic page route
router.get('/:page', async (req, res) => {
    console.log(c('route subpage:', 'y'), req.params.page)
    try {
        const page = req.params.page

        // Getting currUser 
        if (!req.session.currUser) {
            const user = await User.findByPk(req.session.user_id, {
                attributes: { exclude: ['password'] }
            })
            req.session.currUser = user ? user.get({ plain: true }) : null;
        }

        // Get the list of .handlebars files
        const pageList = await listHandlebarsFiles('../views')
        const validPage = pageList.indexOf(page) > -1 ? page : 'homepage'
        const message = validPage === page ? null : 'Page not found, redirecting to homepage...'

        const obj = {
            logged_in: req.session.logged_in,
            user_id: req.session.user_id,
            currUser: req.session.currUser,
            page: validPage,
            message: message,
        }

        res.render(validPage, obj);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
