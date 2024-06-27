const router = require('express').Router();
const userRoutes = require('./userRoutes');
const token = require('./valTokenRoutes');

router.use('/users', userRoutes);
router.use('/token',token);

module.exports = router;
