var craigslist = require('./lib/craigslist')
var growl = require('growl');
var Mongolian = require('mongolian');
var CENTRAL_NJ = 'http://cnj.craigslist.org/search/mca?hasPic=1&minAsk=3000&query=supermoto&srchType=A&format=rss';
var JERSEY_SHORE = 'http://jerseyshore.craigslist.org/search/mca?hasPic=1&minAsk=3000&query=supermoto&srchType=A&format=rss';
var NORTH_JERSEY = 'http://newjersey.craigslist.org/search/mca?hasPic=1&minAsk=3000&query=supermoto&srchType=A&format=rss';
var SOUTH_JERSEY = 'http://southjersey.craigslist.org/search/mca?hasPic=1&minAsk=3000&query=supermoto&srchType=A&format=rss';
var NJRSS = [CENTRAL_NJ, JERSEY_SHORE, NORTH_JERSEY, SOUTH_JERSEY];

var DB_HOST = process.env.MONGOLAB_URI || 'localhost'
var server = new Mongolian();
var db = server.db('supermoto-db');

function storeNewResults(results) {
    var latestId = -1;
    db.collection('results').find().sort({ date: -1 }).toArray(function(err, array) {
        db.collection('results').count(function(err, count) {
            console.log(count + " results already stored.");
            if (count > 0) {
                latestId  = array[0].id;
            }
            for (var i = 0; i < results.length; i++) {
                var result = results[i];
                db.collection('results').insert(result);
            }
        });
    });
}

function checkFeeds(callback) {
    console.log("============================")
    console.log("[" + new Date + "] Starting RSS scrape...");
    NJRSS.forEach(function(feed) {
        craigslist.getListingsFromRss(feed, storeNewResults);
    });
    console.log("============================")
}

function runScript() {
    db.collection('results').ensureIndex({ id: 1 }, { unique: true })
    console.log("Checking feeds...");
    checkFeeds();
    setInterval(checkFeeds, 180000);
    db.collection('results').count(function(count) {
        function notifyIfNew() {
            db.collection('results').count(function(newcount) {
                if (newcount > count) {
                    count = newcount;
                    growl('New listings found!', { title: 'Craigslist' });
                }
            });
        }
        setInterval(notifyIfNew, 300000);
    });
}

runScript();
exports.checkFeeds = checkFeeds;
exports.runScript = runScript;

