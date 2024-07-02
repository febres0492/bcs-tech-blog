const fs = require('fs');
const path = require('path');

function c(str='null', color = 'g'){ // this function is to color the console.log
    const colors = require('colors');
    const opt = { r: 'red', g: 'green', y: 'yellow', b: 'blue'}
    return colors[opt[color]](str) 
}

module.exports = {
    c: c,
    saveQueryToCookie: (req, query) => {
        let previousSearches = req.session.previousSearches || [];
        if (previousSearches.includes(query)) { return } 
        console.log(c('saveQueryToCookie'), query)
        previousSearches.push(query)
        req.session.previousSearches = previousSearches
        console.log(c('previousSearches'), req.session.previousSearches)
    },
    listHandlebarsFiles: (viewsPath) => {
        const viewsDir = path.join(__dirname, viewsPath);
        return new Promise((resolve, reject) => {
            fs.readdir(viewsDir, (err, files) => {
                if (err) {
                    return reject(err);
                }
    
                const handlebarsFiles = files.filter(file => file.endsWith('.handlebars'))
                    .map(file => file.replace('.handlebars', ''));
                resolve(handlebarsFiles);
            });
        });
    }
};
