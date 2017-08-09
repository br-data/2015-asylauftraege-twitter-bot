const fs = require('fs');
const path = require('path');
const url = require('url');
const request = require('request');
const cheerio = require('cheerio');
const htmlparser = require('htmlparser');
const Twit = require('twit');

const config = require('./config');

(function rssToTwitter() {
  // Configuration
  const rssUrl = process.env.RSS_FEED || config.RSS_FEED;
  const twitter = new Twit({

    consumer_key: process.env.CONSUMER_KEY || config.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET || config.CONSUMER_SECRET,
    access_token: process.env.ACCESS_TOKEN || config.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET || config.ACCESS_TOKEN_SECRET
  });

  // Get date of latest posted article
  const lastPostedDate = getPostedDate();

  const handler = new htmlparser.RssHandler();
  const parser = new htmlparser.Parser(handler);

  (function init() {

    getFeed(handleFeed);
    setPostedDate(new Date());
  })();

  function handleFeed(items) {

    for (const key in items) {

      items[key].title = beautifyTitle(items[key].title);
      items[key].location = getLocation(items[key].title);
      items[key].title = removeLocation(items[key].title);
      items[key].company = getItemInfo(items[key], handleItem);
    }
  }

  function handleItem(item) {

    // Tweet only new entries
    if (item.company && item.date >= lastPostedDate) {

      shortenTweet(item, 160, postToTwitter);
    }
  }

  // Get the RSS feed
  function getFeed(callback) {

    let items;
    let itemsToPost = [];

    request(rssUrl, (err, res, body) => {

      if (!err && res.statusCode == 200){

        parser.parseComplete(body);

        items = handler.dom.items;
        itemsToPost = [];

        for (const key in items) {

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

    request(item.link, { jar: true }, (err, res, body) => {

      if (!err && res.statusCode == 200) {

        const $ = cheerio.load(body);

        const addressEl = $('.mlioccur > .timark:contains("Wirtschaftsteilnehmers")').next().children().html();
        let dateEl = $('.date').text();

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

  function shortenTweet(item, length, callback) {

    item.tweet = `#${item.location}: Auftrag für ${item.company}: ${item.title} ${item.link} #asyl`;

    if (item.tweet.length > length) {

      let isShortable = true;

      if (item.title && isShortable) {

        const newTitle = item.title.split(' ').slice(0, -2).join(' ').concat(' …').trim();

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

    twitter.post('statuses/update', { status: item.tweet }, (err, data, res) => {

      console.log("New tweet: ", item.tweet);

      if (err) { console.log(err); }
    });
  }

  // Get the last updated date from file
  function getPostedDate() {

    let dateString;
    const location = path.join(__dirname, '/lastPostedDate.txt');

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

    const location = path.join(__dirname, '/lastPostedDate.txt');

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

  // Sort dates
  function compareDates(a, b) {

    const aDate = new Date(a.pubDate);
    const bDate = new Date(b.pubDate);

    if (aDate < bDate) { return -1; }
    if (aDate > bDate) { return 1; }

    return 0;
  }

  // Clone an object
  function clone(obj) {

    return JSON.parse(JSON.stringify(obj));
  }
})();
