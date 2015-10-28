var request = require('request');
var cheerio = require('cheerio');
var url = require('url');
var htmlparser = require('htmlparser');
var fs = require('fs');
var Twit = require('twit');

(function rssToTwitter() {
    'use strict';

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
        var itemsToPost = [];

        request(rssUrl, function (err, res, body) {

            if (!err && res.statusCode == 200){
                
                parser.parseComplete(body);

                items = handler.dom.items;
                itemsToPost = [];

                for (var key in items) {

                    var itemDate = new Date(items[key].pubDate);
                    
                    if (itemDate > lastestPostedItemDate) {

                        itemsToPost.push(items[key]);
                    }
                }

                callback(itemsToPost.sort(compareDates));

            } else {

                console.log(err.message);
            }
        });
    }

    function handleItem(item) {

        if (item.company) {

            shortenTweet(item, 160, postToTwitter);
            setLatestPostedItemDate(item.pubDate);
        }
    }

    function getItemInfo(item, callback) {

        item.company = '';

        request(item.link, { jar: true }, function (err, res, body) {

            if (!err && res.statusCode == 200) {

                var $ = cheerio.load(body);
                var addressEl = $('.mlioccur > .timark:contains("Wirtschaftsteilnehmers")').next().children().html();

                if (addressEl) {

                    item.company = $('<p>').html(addressEl.split('<br>')[0]).text();
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

        str = str.match(/Deutschland-(.*?):/);

        return str ? str[1] : '';
    }

    function removeLocation(str) {

        return str.replace(/Deutschland-(.*?):\s/, '');
    }

    function beautifyCompanyName(str) {

        str.replace('foo', '');

        return str;
    }

    function shortenTweet(item, length, callback) {

        item.tweet = '#' + item.location + ': Auftrag für ' + item.company + ': ' + item.title + ' ' + item.link + ' #asyl';

        if (item.tweet.length > length) {

            var isShortable = true;

            if (item.title && isShortable) {

                var newTitle = item.title.split(' ').slice(0, -2).join(' ').concat(' …').trim();

                if (newTitle.length && newTitle.length < item.title.length) {

                    item.title = newTitle;
                } else {

                    isShortable = false;
                }
            }

            if (item.company && !isShortable) {

                item.company = item.company.split(' ').slice(0, -1).join(' ').concat(' …').trim();
            }

            shortenTweet(item, length, callback);
        } else {

            callback(item);
        }
    }

    // post item to twitter
    function postToTwitter(item) {

        twitter.post('statuses/update', { status: item.tweet }, function (err, data, res) {
            
            console.log("New tweet: ", item.tweet);

            if (err) { console.log(err); }
        });
    }

    // get the date of the last run
    function getLatestPostedItemDate() {

        var dateString = fs.readFileSync(__dirname + '/lastestPostedDate.txt').toString();
        return new Date(dateString);
    }

    // save the date of the last run
    function setLatestPostedItemDate(date) {

        lastestPostedItemDate = date;
        fs.writeFile(__dirname + '/lastestPostedDate.txt', lastestPostedItemDate);
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

    function clone(obj) {

        return JSON.parse(JSON.stringify(obj));
    } 
})();
