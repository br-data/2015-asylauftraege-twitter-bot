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

    //getFeed(handleFeed);
    handleFeed();
})();

function handleFeed(items) {

   items = [ { id: 'http://ted.europa.eu/udl?uri=TED:NOTICE:369119-2015:TEXT:DE:HTML',
    title: '369119-2015: Deutschland-Zwickau: Dienstleistungen des Sozialwesens und zugehörige Dienstleistungen',
    link: 'http://ted.europa.eu/udl?uri=TED:NOTICE:369119-2015:TEXT:DE:HTML',
    description: 'Datum der Veröffentlichung (PD): 20-10-2015 | Frist (DT):  | Dokument (TD): Vergebene Aufträge',
    pubDate: 'Tue Oct 27 2015 09:01:00 GMT+0100 (CET)' },
  { id: 'http://ted.europa.eu/udl?uri=TED:NOTICE:378174-2015:TEXT:DE:HTML',
    title: '378174-2015: Deutschland-Karlsruhe: Dienstleistungen für Unternehmen: Recht, Marketing, Consulting, Einstellungen, Druck und Sicherheit',
    link: 'http://ted.europa.eu/udl?uri=TED:NOTICE:378174-2015:TEXT:DE:HTML',
    description: 'Datum der Veröffentlichung (PD): 27-10-2015 | Frist (DT):  | Dokument (TD): Vergebene Aufträge',
    pubDate: 'Tue Oct 27 2015 09:01:00 GMT+0100 (CET)' },
  { id: 'http://ted.europa.eu/udl?uri=TED:NOTICE:377457-2015:TEXT:DE:HTML',
    title: '377457-2015: Deutschland-Detmold: Heizöle',
    link: 'http://ted.europa.eu/udl?uri=TED:NOTICE:377457-2015:TEXT:DE:HTML',
    description: 'Datum der Veröffentlichung (PD): 27-10-2015 | Frist (DT):  | Dokument (TD): Vergebene Aufträge',
    pubDate: 'Tue Oct 27 2015 09:01:00 GMT+0100 (CET)' },
  { id: 'http://ted.europa.eu/udl?uri=TED:NOTICE:376267-2015:TEXT:DE:HTML',
    title: '376267-2015: Deutschland-München: Verwaltung von Unterkünften',
    link: 'http://ted.europa.eu/udl?uri=TED:NOTICE:376267-2015:TEXT:DE:HTML',
    description: 'Datum der Veröffentlichung (PD): 24-10-2015 | Frist (DT):  | Dokument (TD): Vergebene Aufträge',
    pubDate: 'Tue Oct 27 2015 09:01:00 GMT+0100 (CET)' },
  { id: 'http://ted.europa.eu/udl?uri=TED:NOTICE:376263-2015:TEXT:DE:HTML',
    title: '376263-2015: Deutschland-Weiden in der Oberpfalz: Unterricht in berufsbildenden weiterführenden Schulen',
    link: 'http://ted.europa.eu/udl?uri=TED:NOTICE:376263-2015:TEXT:DE:HTML',
    description: 'Datum der Veröffentlichung (PD): 24-10-2015 | Frist (DT):  | Dokument (TD): Vergebene Aufträge',
    pubDate: 'Tue Oct 27 2015 09:01:00 GMT+0100 (CET)' },
  { id: 'http://ted.europa.eu/udl?uri=TED:NOTICE:376188-2015:TEXT:DE:HTML',
    title: '376188-2015: Deutschland-München: Dienstleistungen von Sicherheitsdiensten',
    link: 'http://ted.europa.eu/udl?uri=TED:NOTICE:376188-2015:TEXT:DE:HTML',
    description: 'Datum der Veröffentlichung (PD): 24-10-2015 | Frist (DT):  | Dokument (TD): Vergebene Aufträge',
    pubDate: 'Tue Oct 27 2015 09:01:00 GMT+0100 (CET)' },
  { id: 'http://ted.europa.eu/udl?uri=TED:NOTICE:373242-2015:TEXT:DE:HTML',
    title: '373242-2015: Deutschland-Leipzig: Komplett- oder Teilbauleistungen im Hochbau sowie Tiefbauarbeiten',
    link: 'http://ted.europa.eu/udl?uri=TED:NOTICE:373242-2015:TEXT:DE:HTML',
    description: 'Datum der Veröffentlichung (PD): 23-10-2015 | Frist (DT):  | Dokument (TD): Vergebene Aufträge',
    pubDate: 'Tue Oct 27 2015 09:01:00 GMT+0100 (CET)' },
  { id: 'http://ted.europa.eu/udl?uri=TED:NOTICE:371231-2015:TEXT:DE:HTML',
    title: '371231-2015: Deutschland-Düsseldorf: Allgemeine Personaldienstleistungen für die öffentliche Verwaltung',
    link: 'http://ted.europa.eu/udl?uri=TED:NOTICE:371231-2015:TEXT:DE:HTML',
    description: 'Datum der Veröffentlichung (PD): 21-10-2015 | Frist (DT):  | Dokument (TD): Vergebene Aufträge',
    pubDate: 'Tue Oct 27 2015 09:01:00 GMT+0100 (CET)' },
  { id: 'http://ted.europa.eu/udl?uri=TED:NOTICE:371068-2015:TEXT:DE:HTML',
    title: '371068-2015: Deutschland-Zwickau: Sonstige gemeinschaftliche, soziale und persönliche Dienste',
    link: 'http://ted.europa.eu/udl?uri=TED:NOTICE:371068-2015:TEXT:DE:HTML',
    description: 'Datum der Veröffentlichung (PD): 21-10-2015 | Frist (DT):  | Dokument (TD): Vergebene Aufträge',
    pubDate: 'Tue Oct 27 2015 09:01:00 GMT+0100 (CET)' },
  { id: 'http://ted.europa.eu/udl?uri=TED:NOTICE:371061-2015:TEXT:DE:HTML',
    title: '371061-2015: Deutschland-Zwickau: Dienstleistungen des Sozialwesens und zugehörige Dienstleistungen',
    link: 'http://ted.europa.eu/udl?uri=TED:NOTICE:371061-2015:TEXT:DE:HTML',
    description: 'Datum der Veröffentlichung (PD): 21-10-2015 | Frist (DT):  | Dokument (TD): Vergebene Aufträge',
    pubDate: 'Tue Oct 27 2015 09:01:00 GMT+0100 (CET)' },
  { id: 'http://ted.europa.eu/udl?uri=TED:NOTICE:371059-2015:TEXT:DE:HTML',
    title: '371059-2015: Deutschland-Siegen: Verpflegungsdienste',
    link: 'http://ted.europa.eu/udl?uri=TED:NOTICE:371059-2015:TEXT:DE:HTML',
    description: 'Datum der Veröffentlichung (PD): 21-10-2015 | Frist (DT):  | Dokument (TD): Vergebene Aufträge',
    pubDate: 'Tue Oct 27 2015 09:01:00 GMT+0100 (CET)' },
  { id: 'http://ted.europa.eu/udl?uri=TED:NOTICE:371040-2015:TEXT:DE:HTML',
    title: '371040-2015: Deutschland-Zwickau: Sonstige gemeinschaftliche, soziale und persönliche Dienste',
    link: 'http://ted.europa.eu/udl?uri=TED:NOTICE:371040-2015:TEXT:DE:HTML',
    description: 'Datum der Veröffentlichung (PD): 21-10-2015 | Frist (DT):  | Dokument (TD): Vergebene Aufträge',
    pubDate: 'Tue Oct 27 2015 09:01:00 GMT+0100 (CET)' },
  { id: 'http://ted.europa.eu/udl?uri=TED:NOTICE:370299-2015:TEXT:DE:HTML',
    title: '370299-2015: Deutschland-Burgdorf: Mobile, modulare Containergebäude',
    link: 'http://ted.europa.eu/udl?uri=TED:NOTICE:370299-2015:TEXT:DE:HTML',
    description: 'Datum der Veröffentlichung (PD): 21-10-2015 | Frist (DT):  | Dokument (TD): Vergebene Aufträge',
    pubDate: 'Tue Oct 27 2015 09:01:00 GMT+0100 (CET)' },
  { id: 'http://ted.europa.eu/udl?uri=TED:NOTICE:378172-2015:TEXT:DE:HTML',
    title: '378172-2015: Deutschland-Karlsruhe: Dienstleistungen für Unternehmen: Recht, Marketing, Consulting, Einstellungen, Druck und Sicherheit',
    link: 'http://ted.europa.eu/udl?uri=TED:NOTICE:378172-2015:TEXT:DE:HTML',
    description: 'Datum der Veröffentlichung (PD): 27-10-2015 | Frist (DT):  | Dokument (TD): Vergebene Aufträge',
    pubDate: 'Tue Oct 27 2015 09:01:00 GMT+0100 (CET)' },
  { id: 'http://ted.europa.eu/udl?uri=TED:NOTICE:369115-2015:TEXT:DE:HTML',
    title: '369115-2015: Deutschland-Zwickau: Dienstleistungen des Sozialwesens und zugehörige Dienstleistungen',
    link: 'http://ted.europa.eu/udl?uri=TED:NOTICE:369115-2015:TEXT:DE:HTML',
    description: 'Datum der Veröffentlichung (PD): 20-10-2015 | Frist (DT):  | Dokument (TD): Vergebene Aufträge',
    pubDate: 'Tue Oct 27 2015 09:01:00 GMT+0100 (CET)' },
  { id: 'http://ted.europa.eu/udl?uri=TED:NOTICE:369114-2015:TEXT:DE:HTML',
    title: '369114-2015: Deutschland-Zwickau: Dienstleistungen des Sozialwesens und zugehörige Dienstleistungen',
    link: 'http://ted.europa.eu/udl?uri=TED:NOTICE:369114-2015:TEXT:DE:HTML',
    description: 'Datum der Veröffentlichung (PD): 20-10-2015 | Frist (DT):  | Dokument (TD): Vergebene Aufträge',
    pubDate: 'Tue Oct 27 2015 09:01:00 GMT+0100 (CET)' },
  { id: 'http://ted.europa.eu/udl?uri=TED:NOTICE:368475-2015:TEXT:DE:HTML',
    title: '368475-2015: Deutschland-Rostock: Verpflegungsdienste',
    link: 'http://ted.europa.eu/udl?uri=TED:NOTICE:368475-2015:TEXT:DE:HTML',
    description: 'Datum der Veröffentlichung (PD): 20-10-2015 | Frist (DT):  | Dokument (TD): Vergebene Aufträge',
    pubDate: 'Tue Oct 27 2015 09:01:00 GMT+0100 (CET)' },
  { id: 'http://ted.europa.eu/udl?uri=TED:NOTICE:367151-2015:TEXT:DE:HTML',
    title: '367151-2015: Deutschland-Koblenz: Dienstleistungen des Hotel- und Gaststättengewerbes und des Einzelhandels',
    link: 'http://ted.europa.eu/udl?uri=TED:NOTICE:367151-2015:TEXT:DE:HTML',
    description: 'Datum der Veröffentlichung (PD): 17-10-2015 | Frist (DT):  | Dokument (TD): Vergebene Aufträge',
    pubDate: 'Tue Oct 27 2015 09:01:00 GMT+0100 (CET)' },
  { id: 'http://ted.europa.eu/udl?uri=TED:NOTICE:367122-2015:TEXT:DE:HTML',
    title: '367122-2015: Deutschland-Peine: Hausmeisterdienste',
    link: 'http://ted.europa.eu/udl?uri=TED:NOTICE:367122-2015:TEXT:DE:HTML',
    description: 'Datum der Veröffentlichung (PD): 17-10-2015 | Frist (DT):  | Dokument (TD): Vergebene Aufträge',
    pubDate: 'Tue Oct 27 2015 09:01:00 GMT+0100 (CET)' },
  { id: 'http://ted.europa.eu/udl?uri=TED:NOTICE:365361-2015:TEXT:DE:HTML',
    title: '365361-2015: Deutschland-Heilbronn: Bau von Wohnheimen',
    link: 'http://ted.europa.eu/udl?uri=TED:NOTICE:365361-2015:TEXT:DE:HTML',
    description: 'Datum der Veröffentlichung (PD): 17-10-2015 | Frist (DT):  | Dokument (TD): Vergebene Aufträge',
    pubDate: 'Tue Oct 27 2015 09:01:00 GMT+0100 (CET)' },
  { id: 'http://ted.europa.eu/udl?uri=TED:NOTICE:364696-2015:TEXT:DE:HTML',
    title: '364696-2015: Deutschland-Velbert: Gebäudereinigung',
    link: 'http://ted.europa.eu/udl?uri=TED:NOTICE:364696-2015:TEXT:DE:HTML',
    description: 'Datum der Veröffentlichung (PD): 16-10-2015 | Frist (DT):  | Dokument (TD): Vergebene Aufträge',
    pubDate: 'Tue Oct 27 2015 09:01:00 GMT+0100 (CET)' },
  { id: 'http://ted.europa.eu/udl?uri=TED:NOTICE:364069-2015:TEXT:DE:HTML',
    title: '364069-2015: Deutschland-Hamburg: Diverse Möbel',
    link: 'http://ted.europa.eu/udl?uri=TED:NOTICE:364069-2015:TEXT:DE:HTML',
    description: 'Datum der Veröffentlichung (PD): 16-10-2015 | Frist (DT):  | Dokument (TD): Vergebene Aufträge',
    pubDate: 'Tue Oct 27 2015 09:01:00 GMT+0100 (CET)' },
  { id: 'http://ted.europa.eu/udl?uri=TED:NOTICE:361877-2015:TEXT:DE:HTML',
    title: '361877-2015: Deutschland-Kiel: Verpflegungsdienste',
    link: 'http://ted.europa.eu/udl?uri=TED:NOTICE:361877-2015:TEXT:DE:HTML',
    description: 'Datum der Veröffentlichung (PD): 14-10-2015 | Frist (DT):  | Dokument (TD): Vergebene Aufträge',
    pubDate: 'Tue Oct 27 2015 09:01:00 GMT+0100 (CET)' },
  { id: 'http://ted.europa.eu/udl?uri=TED:NOTICE:359898-2015:TEXT:DE:HTML',
    title: '359898-2015: Deutschland-Koblenz: Dienstleistungen des Hotel- und Gaststättengewerbes und des Einzelhandels',
    link: 'http://ted.europa.eu/udl?uri=TED:NOTICE:359898-2015:TEXT:DE:HTML',
    description: 'Datum der Veröffentlichung (PD): 13-10-2015 | Frist (DT):  | Dokument (TD): Vergebene Aufträge',
    pubDate: 'Tue Oct 27 2015 09:01:00 GMT+0100 (CET)' },
  { id: 'http://ted.europa.eu/udl?uri=TED:NOTICE:359875-2015:TEXT:DE:HTML',
    title: '359875-2015: Deutschland-Karlsruhe: Dienstleistungen von Detekteien und Sicherheitsdiensten',
    link: 'http://ted.europa.eu/udl?uri=TED:NOTICE:359875-2015:TEXT:DE:HTML',
    description: 'Datum der Veröffentlichung (PD): 13-10-2015 | Frist (DT):  | Dokument (TD): Vergebene Aufträge',
    pubDate: 'Tue Oct 27 2015 09:01:00 GMT+0100 (CET)' },
  { id: 'http://ted.europa.eu/TED/rss/CustomRSSFeedGenerator/239154/de/fullSearch',
    title: 'Mehr...',
    link: 'http://ted.europa.eu/TED/rss/CustomRSSFeedGenerator/239154/de/fullSearch',
    description: 'In TED gibt es mehrere Veröffentlichungen, die diese Kriterien erfüllen. Um weitere Informationen zu erhalten, klicken Sie bitte auf den Link',
    pubDate: 'Tue Oct 27 2015 09:01:00 GMT+0100 (CET)' } ];

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

    postToTwitter(item);
    // setLatestPostedItemDate(itemsToPost[i].pubDate);
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

// post item to twitter
function postToTwitter(item) {

    var shortTweet = shortenTweet(item);

    function shortenTweet(_item) {

        var tweet = 'Neuer Auftrag: ' + _item.company + ': ' + _item.title + ' (' + _item.location + '): ' + _item.link + ' #asyl';

        if (tweet.length > 150) {

            var title = _item.title.split(' ');

            if (title) {

                console.log(title);

                // remove last two words and add ellipsis
                title.splice(0, title.length - 2);
                _item.title = title.join(' ');
            }
           
            return shortenTweet(_item);
        } else {

            return tweet;
        }
    }

    console.log(shortTweet);

    // twitter.post('statuses/update', { status: tweet }, function (err, data, res) {
             
    //     if (err) { console.log(err); }
         
    //     console.log(data);
    //  });
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
