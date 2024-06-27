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
    }
};
