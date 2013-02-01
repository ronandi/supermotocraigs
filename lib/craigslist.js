var feedparser = require('feedparser');

exports.getListingsFromRss = function(url, callback) {
    //remove trailing slash and form rss url
    var results = [];
    feedparser.parseUrl(url).on('article', function(article) {
            results.push({
                title: article.title,
                url: article.link,
                date: article.date,
                id: article.link.split('/').pop().replace(".html", "")
            });
    })
    .on('error', function(err) {
        console.log("Error for feed: " + url);
        console.log(err);
    })
    .on('complete', function() {
        console.log("found " + results.length  + " listings from RSS feed");
        if (callback) callback(results);
    });
}

exports.getRssUrl = function(url) {
    url = url.replace(/\/$/, '') + "/index.rss";
    return url;
}

