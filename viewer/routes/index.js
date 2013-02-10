
/*
 * GET home page.
 */

var Mongolian = require('mongolian');
var db = new Mongolian().db('test-supermoto-db');

exports.index = function(req, res) {
    var locals = {};
    locals.title = 'Craigslist Scraper';
    db.collection('results').find().sort({ date: -1 }).toArray(function(err, array) {
        if (err) {
            console.log(err);
            locals.error = err;
        }
        locals.results = array;
        res.render('index', locals);
    });
};
