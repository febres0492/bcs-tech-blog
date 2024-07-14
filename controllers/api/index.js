const fs = require('fs');
const path = require('path');
const router = require('express').Router();

// Get all route files
const routeFiles = fs.readdirSync(__dirname).filter(file => file.endsWith('Routes.js'));

// Dynamically require and use each route
routeFiles.forEach(file => {
    const route = require(path.join(__dirname, file))
    const routeName = `/${path.basename(file, '.js').replace('Routes', '').toLowerCase()}`
    console.log('routeName:', routeName)
    router.use(routeName, route)
});

module.exports = router;
