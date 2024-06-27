const router = require('express').Router();
const { User } = require('../../models');
const c = require('../../utils/helpers').c
const bcrypt = require('bcrypt')
const sequelize = require('../../config/connection')

// logging in the user
router.post('/login', async (req, res) => {
    console.log(c('logging in the user','r'), req.body)
    try {
        const userData = await User.findOne({ where: { email: req.body.email } });
        if (!userData) {
            res
                .status(400)
                .json({ message: 'Incorrect email or password, please try again' });
            return;
        }

        const validPassword = await userData.checkPassword(req.body.password);
        console.log(c('validPassword'), validPassword)
        if (!validPassword) {
            return res.status(400).json({ message: 'Incorrect email or password, please try again' });
        }

        req.session.save(() => {
            req.session.user_id = userData.id;
            req.session.logged_in = true;
            console.log(c('You are now logged in'))
            res.json({ user: userData, message: 'You are now logged in!' });
        });

    } catch (err) {
        console.log(c('err','r'), err)
        res.status(400).json(err);
    }
})

// logging out the user
router.post('/logout', (req, res) => {
    if (req.session.logged_in) {
        req.session.destroy(() => {
            res.status(204).end();
        });
    } else {
        res.status(404).end();
    }
})

// creating a new user
router.post('/signup', async (req, res) => {
    console.log('req.body', req.body)
    try {

        const userAlreadyExist = await User.findOne({ where: { email: req.body.email } })
        if (userAlreadyExist) {
            res.status(409).json({ message: 'Email already in use' })
            return
        }

        // renaming name_lastname to name
        const data = { ...req.body, name: req.body.name_lastname }
        delete data.name_lastname
        const userData = await User.create(data)

        req.session.save(() => {
            req.session.user_id = userData.id
            req.session.logged_in = true

            res.status(200).json(userData)
        })
    } catch (err) {
        console.log('err', err)
        res.status(400).json(err)
    }
})

// updating user's password when logged in
router.put('/update_password', async (req, res) => {
    const currentUser = await User.findOne({ where: { email: req.body.email } });
    if (!currentUser) {
        return res.status(404).json({ message: 'User not found' });
    }

    const checkingCurPass = await bcrypt.compare(req.body.currentPassword, currentUser.password);
    if(!checkingCurPass){
        return res.status(400).json({ message: 'Wrong current password' });
    }

    const isNewPassSameAsCurPass = await bcrypt.compare(req.body.newPassword, currentUser.password);
    if(isNewPassSameAsCurPass){
        return res.status(400).json({ message: 'New password cannot be the same as Old password' });
    }

    const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
    currentUser.password = hashedPassword;
    await currentUser.save();

    // loggin in the user
    req.session.user_id = currentUser.id;
    req.session.logged_in = true;

    return res.status(200).json({ message: 'Password Updated' });
})

// getting user's previous searches
router.get('/get_prev_searches', (req, res) => {
    const previousSearches = req.session.previousSearches || []
    console.log(c('previousSearches'), previousSearches)
    res.status(200).json({ searches: previousSearches })
})

// query db
router.post('/db_query', async (req, res) => {
    const { password, query } = req.body

    if (!password || password !== process.env.ADMIN_PASSWORD) {
        return res.status(403).json({ message: 'Invalid password' })
    }

    try {
        const [results] = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT })

        res.status(200).json({ results })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})

module.exports = router;
