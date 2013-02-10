var craigslist = require('./lib/craigslist')
var Mongolian = require('mongolian');
var CENTRAL_NJ = 'http://cnj.craigslist.org/search/mca?hasPic=1&minAsk=3000&query=supermoto&srchType=A&format=rss';
var JERSEY_SHORE = 'http://jerseyshore.craigslist.org/search/mca?hasPic=1&minAsk=3000&query=supermoto&srchType=A&format=rss';
var NORTH_JERSEY = 'http://newjersey.craigslist.org/search/mca?hasPic=1&minAsk=3000&query=supermoto&srchType=A&format=rss';
var SOUTH_JERSEY = 'http://southjersey.craigslist.org/search/mca?hasPic=1&minAsk=3000&query=supermoto&srchType=A&format=rss';
var NJRSS = [CENTRAL_NJ, JERSEY_SHORE, NORTH_JERSEY, SOUTH_JERSEY];
var REFRESH_TIME = 1800000; // 1 hour
var DB_HOST = process.env.MONGOLAB_URI || 'localhost'
var server = new Mongolian({
    log: {
        debug: function(message) {},
        info: function(message) {},
        warn: function(message) {
            console.log(message);
        },
        error: function(message) {
            console.log(message);
        }
    }
});
var db = server.db('supermoto-db');

function storeNewResults(results) {
    var latestId = -1;
    db.collection('results').find().sort({ date: -1 }).toArray(function(err, array) {
        db.collection('results').count(function(err, count) {
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
    console.log("[" + new Date + "] Starting RSS scrape...");
    NJRSS.forEach(function(feed) {
        console.log("Scraping " + feed);
        craigslist.getListingsFromRss(feed, storeNewResults);
    });
}

function runScript() {
    db.collection('results').ensureIndex({ id: 1 }, { unique: true })
    checkFeeds();
    setInterval(checkFeeds, REFRESH_TIME);
    db.collection('results').count(function(count) {
        function notifyIfNew() {
            db.collection('results').count(function(newcount) {
                if (newcount > count) {
                    count = newcount;
                    console.log('New listings found!');
                }
            });
        }
        setInterval(notifyIfNew, 300000);
    });
}

runScript();
exports.checkFeeds = checkFeeds;
exports.runScript = runScript;

