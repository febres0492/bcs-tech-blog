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
        if (userData == null) {
            return res.status(400).json({ message: 'Email not found. <br>Please verify the email.' });
        }

        const validPassword = userData.checkPassword(req.body.password);
        console.log(c('validPassword'), validPassword)
        if (!validPassword) {
            return res.status(400).json({ message: 'Incorrect email or password, please try again' });
        }

        const currUser = userData.get({ plain: true })
        delete currUser.password

        console.log(c('currUser'), currUser)

        req.session.save(() => {
            req.session.user_id = userData.id;
            req.session.logged_in = true;
            req.session.currUser = currUser
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
    console.log(c('logging out the user','r'))
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

// updating user's password when logged out
router.put('/updatepassword', async (req, res) => {
    try {
        // Import token from database
        const tokenItem = await Token.findOne({ where: { user_email: req.body.email } });

        if (!tokenItem) {
            return res.status(400).json({ message: 'Token not found. Please make sure is the right token' });
        }

        if (req.body.token !== tokenItem.token) {
            return res.status(400).json({ message: 'Token doesn\'t match. Please make sure is the right token' });
        }
        
        const currentUser = await User.findOne({ where: { email: req.body.email } });
        if (!currentUser) {
            return res.status(404).json({ message: 'User not found. Please check the email' });
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

        res.status(200).json({ message: 'Password updated successfully' });

    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ message: 'An error occurred while updating the password' });
    }
});

// getting the current user
router.get('/current_user', (req, res) => {
    console.log(c('getting the current user','r'))
    if (req.session.logged_in) {
        res.json(req.session.currUser);
    } else {
        res.status(404).end();
    }
})

// query db
router.post('/db_query', async (req, res) => {
    const { password, query } = req.body;
    console.log(c('query db'), req.body, query)

    if (password == undefined || !password || password !== process.env.ADMIN_PASSWORD) {
        return res.status(403).json({ message: 'Invalid password' })
    }

    try {
        const [results] = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT })
        res.status(200).json({ message: 'success', results })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})

module.exports = router;
