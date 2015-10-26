var request = require('request');
var cheerio = require('cheerio');
var url = require('url');
var htmlparser = require('htmlparser');
var fs = require('fs');
var Twit = require('twit');

// Config variables
var rssUrl = 'http://ted.europa.eu/TED/rss/CustomRSSFeedGenerator/239154/de';

var twitter = new Twit({

    consumer_key: process.env.CONSUMER_KEY                  || 'engp8PvvP9kMEb8MrE2qT8DPw',
    consumer_secret: process.env.CONSUMER_SECRET            || 'HbRprEITtD3K25Hn47P6qzzaoLuCSXURrnsHm9GfknK0cTQe5M',
    access_token: process.env.ACCESS_TOKEN                  || '3577194683-jmBzibEJM9gEcy9QqSfpmlYzxehXtlzeb9xYUUm',
    access_token_secret: process.env.ACCESS_TOKEN_SECRET    || 'FgsUeQxn1sg5Agx0jlxkpB4qb5BxWfYYnl78XcGAJ6mtT'
});

// Get date of latest posted article
var lastestPostedItemDate = getLatestPostedItemDate();

// Needed for RSS parsing
var handler = new htmlparser.RssHandler();
var parser = new htmlparser.Parser(handler);

(function init() {

    getFeed(handleFeed);
})();

function handleFeed(items) {

    for (var key in items) {

        items[key].title = beautifyTitle(items[key].title);
        items[key].location = getLocation(items[key].title);
        items[key].title = removeLocation(items[key].title);
        items[key].company = getItemInfo(items[key], handleItem);
    }
}

function getFeed(callback) {

    var items;
    var itemsToPublish = [];

    request(rssUrl, function (err, res, body) {

        if (!err && res.statusCode == 200){
            
            parser.parseComplete(body);

            items = handler.dom.items;
            itemsToPublish = [];

            for (var key in items) {

                var itemDate = new Date(items[key].pubDate);
                
                if (itemDate > lastestPostedItemDate) {

                    itemsToPublish.push(items[key]);
                }
            }

            callback(itemsToPublish.sort(compareDates));

        } else {

            console.log(err.message);
        }
    });
}

function handleItem(item) {

    var tweet = item.company + ': ' + item.title + ' in ' + item.location + ': ' + item.link;
    console.log(tweet, tweet.length);

    // publishToTwitter(itemsToPublish[i]);
    // setLatestPostedItemDate(itemsToPublish[i].pubDate);
}

function getItemInfo(item, callback) {

    item.company = '';

    request(item.link, { jar: true }, function (err, res, body) {

        if (!err && res.statusCode == 200) {

            var $ = cheerio.load(body);
            var addressEl = $('.mlioccur > .timark:contains("Wirtschaftsteilnehmers")').next().children().html();

            if (addressEl) {

                item.company = addressEl.split('<br>')[0];
            }

            callback(item);

        } else {

            console.log(err.message);
        }
    });
}

function beautifyTitle(str) {

    return str.replace(/.*\d:\s/, '');
}

function getLocation(str) {

    str = str.match(/Deutschland-(.*):/);

    return str ? str[1] : '';
}

function removeLocation(str) {

    return str.replace(/Deutschland-(.*):\s/, '');
}

// post item to twitter
function publishToTwitter(item) {

    var tweet = item.title + ' ' + item.link;
    
    twitter.post('statuses/update', { status: tweet }, function (err, data, response) {
             
        if (err) { console.log(err); }
         
        console.log(data);
     });
}

// get the date of the last run
function getLatestPostedItemDate() {

    var dateString = fs.readFileSync('lastestPostedDate.txt').toString();
    return new Date(dateString);
}

// save the date of the last run
function setLatestPostedItemDate(date) {

    lastestPostedItemDate = date;
    fs.writeFile('lastestPostedDate.txt', lastestPostedItemDate);
    return true;
}

// function to sort of dates
function compareDates(a, b) {

    var aDate = new Date(a.pubDate);
    var bDate = new Date(b.pubDate);

    if (aDate < bDate) { return -1; }
    if (aDate > bDate) { return 1; }

    return 0;
}
