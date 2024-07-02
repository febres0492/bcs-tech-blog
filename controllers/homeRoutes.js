const router = require('express').Router();
const { User, Token } = require('../models');
const withAuth = require('../utils/auth');
const { c } = require('../utils/helpers')
const bcrypt = require('bcrypt');


// main page no need to be logged in
router.get('/', async (req, res) => {
    console.log(c('req.session: ','r'))
    try {
        res.render('homepage', {homePage: true});
    } catch (err) {
        res.status(500).json(err);
    }
});

router.get('/login', (req, res) => {
    if (req.session.logged_in) {
        res.redirect('/');
        return;
    }

    res.render('login');
});

router.get('/signup', (req, res) => {
    if (req.session.logged_in) {
        res.redirect('/')
        return
    }

    res.render('signup')
})

router.get('/forgotpwform', (req, res) => {
    if (req.session.logged_in) {
        res.redirect('/')
        return
    }

    res.render('forgotpwform')
})

router.get('/passwordresetform', (req, res) => {
    if (req.session.logged_in) {
        res.redirect('/')
        return
    }
    res.render('passwordresetform')
})

// router.get('/:page', withAuth, async (req, res) => {
router.get('/:page', withAuth, async (req, res) => {
    try {
        const page = req.params.page
        console.log(c('route subpage: '), page)

        // getting currUser 
        if (!req.session.currUser) {
            const user = await User.findByPk(req.session.user_id, {
                attributes: { exclude: ['password'] }
            })
            req.session.currUser = user ? user.get({ plain: true }) : null
        }

        const pageList = ['homepage', 'user_settings']
        const validPage = pageList.indexOf(page) > -1 ? page : 'homepage'
        const message = validPage === page ? null : 'Page not found, redirecting to homepage...'

        console.log(c('current user: '), req.session.currUser)

        res.render(validPage, {
            logged_in: req.session.logged_in,
            user_id: req.session.user_id,
            currUser: req.session.currUser,
            page: validPage,
            message: message,
        })
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
