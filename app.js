var fs = require('fs');
var path = require('path');
var url = require('url');
var request = require('request');
var cheerio = require('cheerio');
var htmlparser = require('htmlparser');
var Twit = require('twit');

(function rssToTwitter() {
    'use strict';

    // Configuration
    var rssUrl = 'http://ted.europa.eu/TED/rss/CustomRSSFeedGenerator/239154/de';
    var twitter = new Twit({

        consumer_key: process.env.CONSUMER_KEY                  || 'zxgsFhtGxMlWwae7HToHfdXeD',
        consumer_secret: process.env.CONSUMER_SECRET            || 'OaZwjigNLSqP6Na7jb18JDqP79LES7514byivUmnFE81cHyYFW',
        access_token: process.env.ACCESS_TOKEN                  || '4010493202-A1zN0IpJyA1P8Hrm4rXJUR4YwgzayxOueTOuPno',
        access_token_secret: process.env.ACCESS_TOKEN_SECRET    || 'UZUVMCeFw6c5cup14HxdCJtX76l3LNmZcAd7anZxhBAIi'
    });

    // Get date of latest posted article
    var lastPostedDate = getPostedDate();

    var handler = new htmlparser.RssHandler();
    var parser = new htmlparser.Parser(handler);

    (function init() {

        getFeed(handleFeed);
        setPostedDate(new Date());
    })();

    function handleFeed(items) {

        for (var key in items) {

            items[key].title = beautifyTitle(items[key].title);
            items[key].location = getLocation(items[key].title);
            items[key].title = removeLocation(items[key].title);
            items[key].company = getItemInfo(items[key], handleItem);
        }
    }

    function handleItem(item) {

        // Tweet only new entries 
        if (item.company && item.date > lastPostedDate) {

            shortenTweet(item, 160, postToTwitter);
        }
    }

    // Get the RSS feed
    function getFeed(callback) {

        var items;
        var itemsToPost = [];

        request(rssUrl, function (err, res, body) {

            if (!err && res.statusCode == 200){
                
                parser.parseComplete(body);

                items = handler.dom.items;
                itemsToPost = [];

                for (var key in items) {

                    itemsToPost.push(items[key]);
                }

                callback(itemsToPost);

            } else {

                console.log(err.message);
            }
        });
    }

    // Get company name and publication date from the tender page
    function getItemInfo(item, callback) {

        item.company = '';
        item.date = '';

        request(item.link, { jar: true }, function (err, res, body) {

            if (!err && res.statusCode == 200) {

                var $ = cheerio.load(body);

                var addressEl = $('.mlioccur > .timark:contains("Wirtschaftsteilnehmers")').next().children().html();
                var dateEl = $('.date').text();

                if (addressEl) {

                    item.company = $('<p>').html(addressEl.split('<br>')[0]).text();
                }

                if (dateEl) {

                    dateEl = dateEl.split('/').reverse().join();
                    item.date = new Date(dateEl);
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

    function postToTwitter(item) {

        twitter.post('statuses/update', { status: item.tweet }, function (err, data, res) {
        
            console.log("New tweet: ", item.tweet);

            if (err) { console.log(err); }
        });
    }

    // Get the last updated date from file
    function getPostedDate() {

        var dateString;
        var location = path.join(__dirname, '/lastPostedDate.txt');

        try {

            dateString = fs.readFileSync(location, 'utf8');
        } catch (err) {

            if (err.code === 'ENOENT') {

                console.log('Cannot read ', location);
            } else {

                throw err;
            }
        }

        return new Date(dateString);
    }

    // Save the last updated date to file
    function setPostedDate(date) {

        var location = path.join(__dirname, '/lastPostedDate.txt');

        try {

            fs.writeFileSync(location, date, 'utf8');
        } catch (err) {

            if (err.code === 'ENOENT') {

                console.log('Cannot write ', location);
            } else {

                throw err;
            }
        }
    }

    // Sort dates
    function compareDates(a, b) {

        var aDate = new Date(a.pubDate);
        var bDate = new Date(b.pubDate);

        if (aDate < bDate) { return -1; }
        if (aDate > bDate) { return 1; }

        return 0;
    }

    // Clone an object
    function clone(obj) {

        return JSON.parse(JSON.stringify(obj));
    } 
})();
