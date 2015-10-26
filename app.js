var request = require('request');
var url = require('url');
var htmlparser = require('htmlparser');
var fs = require('fs');
var Twit = require('twit');

// Config variables
var rssUrl = 'http://ted.europa.eu/TED/rss/CustomRSSFeedGenerator/239154/de?fmt=xml';
var intervalLength = 2000;

var twitter = new Twit({

    consumer_key: process.env.CONSUMER_KEY || 'engp8PvvP9kMEb8MrE2qT8DPw',
    consumer_secret: process.env.CONSUMER_SECRET || 'HbRprEITtD3K25Hn47P6qzzaoLuCSXURrnsHm9GfknK0cTQe5M',
    access_token: process.env.ACCESS_TOKEN || '3577194683-jmBzibEJM9gEcy9QqSfpmlYzxehXtlzeb9xYUUm',
    access_token_secret: process.env.ACCESS_TOKEN_SECRET || 'FgsUeQxn1sg5Agx0jlxkpB4qb5BxWfYYnl78XcGAJ6mtT'
});

// Get date of latest posted article
var lastestPostedItemDate = getLatestPostedItemDate();

// Needed for RSS parsing
var handler = new htmlparser.RssHandler();
var parser = new htmlparser.Parser(handler);

// function to sort of dates
function compareDates(a, b) {

    var aDate = new Date(a.pubDate);
    var bDate = new Date(b.pubDate);

    if (aDate < bDate) {

        return -1;
    }

    if (aDate > bDate) {

        return 1;
    }
    return 0;
}

// get the date (uses flat file to be replaced with MongoDB)
function getLatestPostedItemDate() {

    var dateString = fs.readFileSync('lastestPostedDate.txt').toString();
    return new Date(dateString);
}

// set the date (uses flat file to be replaced with MongoDB)
function setLatestPostedItemDate(date) {

    lastestPostedItemDate = date;
    // write to file
    fs.writeFile('lastestPostedDate.txt', lastestPostedItemDate);
    return true;
}

// post item to twitter
function publishToTwitter(item) {
    var tweet = item.title + ' ' + item.link;
    console.log('publishing to twitter');
    
    twitter.post('statuses/update', { status: tweet }, function(err, data, response) {
		     if (err)
			 console.log(err);
		     console.log(data);
		 });

}

// looping on the server (every second)
setInterval(function() {

    request({uri: rssUrl}, function(err, response, body){

        // Basic error check
        if(err && response.statusCode !== 200){
            
            console.log('Request error.');
        }
        
        parser.parseComplete(body);
        var items = handler.dom.items;
        var itemsToPublish = []; // Array

        for(var key in items){

            //console.log(prop + ': ' + items[prop].title + ' ' + items[prop].link + '\n');
            var itemDate = new Date(items[key].pubDate);
            if(itemDate > lastestPostedItemDate){
                // add to a publish array here
                itemsToPublish.push(items[key]);
            }
        }
        // sort items to publish on pubDate
        itemsToPublish.sort(compareDates);

        for(var i in itemsToPublish){

            console.log(itemsToPublish[i].pubDate + ' ' + itemsToPublish[i].title);
            publishToTwitter(itemsToPublish[i]);
            setLatestPostedItemDate(itemsToPublish[i].pubDate);
        }
    });
    console.log('\n');
}, intervalLength);
