const withAuth = (req, res, next) => {
    if (!req.session.logged_in) {
        res.redirect('/');
    } else {
        next();
    }
};

function whenLoggedIn (req, res, next) {
    if (req.session.logged_in) {
        return next()
    }
    res.status(401).json({ message: 'Unauthorized access' })
}

module.exports = { withAuth, whenLoggedIn }
