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

    items = [
    { id: 'http://ted.europa.eu/udl?uri=TED:NOTICE:378174-2015:TEXT:DE:HTML',
      title: 'Dienstleistungen für Unternehmen: Recht, Marketing, Consulting, Einstellungen, Druck und Sicherheit',
      link: 'http://ted.europa.eu/udl?uri=TED:NOTICE:378174-2015:TEXT:DE:HTML',
      description: 'Datum der Veröffentlichung (PD): 27-10-2015 | Frist (DT):  | Dokument (TD): Vergebene Aufträge',
      pubDate: 'Tue Oct 27 2015 09:01:00 GMT+0100 (CET)',
      location: 'Karlsruhe',
      company: 'b.i.g sicherheit GmbH Objekt- und Personenschutz' },
    // { id: 'http://ted.europa.eu/udl?uri=TED:NOTICE:371040-2015:TEXT:DE:HTML',
    //   title: 'Sonstige gemeinschaftliche, soziale und persönliche Dienste',
    //   link: 'http://ted.europa.eu/udl?uri=TED:NOTICE:371040-2015:TEXT:DE:HTML',
    //   description: 'Datum der Veröffentlichung (PD): 21-10-2015 | Frist (DT):  | Dokument (TD): Vergebene Aufträge',
    //   pubDate: 'Tue Oct 27 2015 09:01:00 GMT+0100 (CET)',
    //   location: 'Zwickau',
    //   company: 'Johanniter-Unfall-Hilfe e. V. Regionalverband Zwickau/Vogtland' },
    // { id: 'http://ted.europa.eu/udl?uri=TED:NOTICE:361877-2015:TEXT:DE:HTML',
    //   title: 'Verpflegungsdienste',
    //   link: 'http://ted.europa.eu/udl?uri=TED:NOTICE:361877-2015:TEXT:DE:HTML',
    //   description: 'Datum der Veröffentlichung (PD): 14-10-2015 | Frist (DT):  | Dokument (TD): Vergebene Aufträge',
    //   pubDate: 'Tue Oct 27 2015 09:01:00 GMT+0100 (CET)',
    //   location: 'Kiel',
    //   company: 'Vivanti GmbH' },
    // { id: 'http://ted.europa.eu/udl?uri=TED:NOTICE:376267-2015:TEXT:DE:HTML',
    //   title: 'Verwaltung von Unterkünften',
    //   link: 'http://ted.europa.eu/udl?uri=TED:NOTICE:376267-2015:TEXT:DE:HTML',
    //   description: 'Datum der Veröffentlichung (PD): 24-10-2015 | Frist (DT):  | Dokument (TD): Vergebene Aufträge',
    //   pubDate: 'Tue Oct 27 2015 09:01:00 GMT+0100 (CET)',
    //   location: 'München',
    //   company: 'Fairprice Hostels GmbH' },
    // { id: 'http://ted.europa.eu/udl?uri=TED:NOTICE:377457-2015:TEXT:DE:HTML',
    //   title: 'Heizöle',
    //   link: 'http://ted.europa.eu/udl?uri=TED:NOTICE:377457-2015:TEXT:DE:HTML',
    //   description: 'Datum der Veröffentlichung (PD): 27-10-2015 | Frist (DT):  | Dokument (TD): Vergebene Aufträge',
    //   pubDate: 'Tue Oct 27 2015 09:01:00 GMT+0100 (CET)',
    //   location: 'Detmold',
    //   company: 'Lausen Mineralöl- und Schmierstoffhandel GmbH' },
    // { id: 'http://ted.europa.eu/udl?uri=TED:NOTICE:370299-2015:TEXT:DE:HTML',
    //   title: 'Mobile, modulare Containergebäude',
    //   link: 'http://ted.europa.eu/udl?uri=TED:NOTICE:370299-2015:TEXT:DE:HTML',
    //   description: 'Datum der Veröffentlichung (PD): 21-10-2015 | Frist (DT):  | Dokument (TD): Vergebene Aufträge',
    //   pubDate: 'Tue Oct 27 2015 09:01:00 GMT+0100 (CET)',
    //   location: 'Burgdorf',
    //   company: 'SILOCO GmbH & Co. KG' },
    // { id: 'http://ted.europa.eu/udl?uri=TED:NOTICE:359898-2015:TEXT:DE:HTML',
    //   title: 'Dienstleistungen des Hotel- und Gaststättengewerbes und des Einzelhandels',
    //   link: 'http://ted.europa.eu/udl?uri=TED:NOTICE:359898-2015:TEXT:DE:HTML',
    //   description: 'Datum der Veröffentlichung (PD): 13-10-2015 | Frist (DT):  | Dokument (TD): Vergebene Aufträge',
    //   pubDate: 'Tue Oct 27 2015 09:01:00 GMT+0100 (CET)',
    //   location: 'Koblenz',
    //   company: 'Klüh Catering GmbH' },
    // { id: 'http://ted.europa.eu/udl?uri=TED:NOTICE:376188-2015:TEXT:DE:HTML',
    //   title: 'Dienstleistungen von Sicherheitsdiensten',
    //   link: 'http://ted.europa.eu/udl?uri=TED:NOTICE:376188-2015:TEXT:DE:HTML',
    //   description: 'Datum der Veröffentlichung (PD): 24-10-2015 | Frist (DT):  | Dokument (TD): Vergebene Aufträge',
    //   pubDate: 'Tue Oct 27 2015 09:01:00 GMT+0100 (CET)',
    //   location: 'München',
    //   company: 'ESD Sicherheitsdienst GmbH' },
    // { id: 'http://ted.europa.eu/udl?uri=TED:NOTICE:369114-2015:TEXT:DE:HTML',
    //   title: 'Dienstleistungen des Sozialwesens und zugehörige Dienstleistungen',
    //   link: 'http://ted.europa.eu/udl?uri=TED:NOTICE:369114-2015:TEXT:DE:HTML',
    //   description: 'Datum der Veröffentlichung (PD): 20-10-2015 | Frist (DT):  | Dokument (TD): Vergebene Aufträge',
    //   pubDate: 'Tue Oct 27 2015 09:01:00 GMT+0100 (CET)',
    //   location: 'Zwickau',
    //   company: 'Diakoniewerk Westsachsen gGmbH' },
    // { id: 'http://ted.europa.eu/udl?uri=TED:NOTICE:371231-2015:TEXT:DE:HTML',
    //   title: 'Allgemeine Personaldienstleistungen für die öffentliche Verwaltung',
    //   link: 'http://ted.europa.eu/udl?uri=TED:NOTICE:371231-2015:TEXT:DE:HTML',
    //   description: 'Datum der Veröffentlichung (PD): 21-10-2015 | Frist (DT):  | Dokument (TD): Vergebene Aufträge',
    //   pubDate: 'Tue Oct 27 2015 09:01:00 GMT+0100 (CET)',
    //   location: 'Düsseldorf',
    //   company: 'Randstad Outsourcing GmbH' },
    // { id: 'http://ted.europa.eu/udl?uri=TED:NOTICE:364069-2015:TEXT:DE:HTML',
    //   title: 'Diverse Möbel',
    //   link: 'http://ted.europa.eu/udl?uri=TED:NOTICE:364069-2015:TEXT:DE:HTML',
    //   description: 'Datum der Veröffentlichung (PD): 16-10-2015 | Frist (DT):  | Dokument (TD): Vergebene Aufträge',
    //   pubDate: 'Tue Oct 27 2015 09:01:00 GMT+0100 (CET)',
    //   location: 'Hamburg',
    //   company: 'Meier Medizintechnik' },
    // { id: 'http://ted.europa.eu/udl?uri=TED:NOTICE:371059-2015:TEXT:DE:HTML',
    //   title: 'Verpflegungsdienste',
    //   link: 'http://ted.europa.eu/udl?uri=TED:NOTICE:371059-2015:TEXT:DE:HTML',
    //   description: 'Datum der Veröffentlichung (PD): 21-10-2015 | Frist (DT):  | Dokument (TD): Vergebene Aufträge',
    //   pubDate: 'Tue Oct 27 2015 09:01:00 GMT+0100 (CET)',
    //   location: 'Siegen',
    //   company: 'Fischer Cateringservice & Events' },
    // { id: 'http://ted.europa.eu/udl?uri=TED:NOTICE:369115-2015:TEXT:DE:HTML',
    //   title: 'Dienstleistungen des Sozialwesens und zugehörige Dienstleistungen',
    //   link: 'http://ted.europa.eu/udl?uri=TED:NOTICE:369115-2015:TEXT:DE:HTML',
    //   description: 'Datum der Veröffentlichung (PD): 20-10-2015 | Frist (DT):  | Dokument (TD): Vergebene Aufträge',
    //   pubDate: 'Tue Oct 27 2015 09:01:00 GMT+0100 (CET)',
    //   location: 'Zwickau',
    //   company: 'Pandechaion GmbH' },
    // { id: 'http://ted.europa.eu/udl?uri=TED:NOTICE:365361-2015:TEXT:DE:HTML',
    //   title: 'Bau von Wohnheimen',
    //   link: 'http://ted.europa.eu/udl?uri=TED:NOTICE:365361-2015:TEXT:DE:HTML',
    //   description: 'Datum der Veröffentlichung (PD): 17-10-2015 | Frist (DT):  | Dokument (TD): Vergebene Aufträge',
    //   pubDate: 'Tue Oct 27 2015 09:01:00 GMT+0100 (CET)',
    //   location: 'Heilbronn',
    //   company: 'FAGSi Vertriebs und Vermietungs GmbH' },
    // { id: 'http://ted.europa.eu/udl?uri=TED:NOTICE:369119-2015:TEXT:DE:HTML',
    //   title: 'Dienstleistungen des Sozialwesens und zugehörige Dienstleistungen',
    //   link: 'http://ted.europa.eu/udl?uri=TED:NOTICE:369119-2015:TEXT:DE:HTML',
    //   description: 'Datum der Veröffentlichung (PD): 20-10-2015 | Frist (DT):  | Dokument (TD): Vergebene Aufträge',
    //   pubDate: 'Tue Oct 27 2015 09:01:00 GMT+0100 (CET)',
    //   location: 'Zwickau',
    //   company: 'European Homecare GmbH' },
    // { id: 'http://ted.europa.eu/udl?uri=TED:NOTICE:371068-2015:TEXT:DE:HTML',
    //   title: 'Sonstige gemeinschaftliche, soziale und persönliche Dienste',
    //   link: 'http://ted.europa.eu/udl?uri=TED:NOTICE:371068-2015:TEXT:DE:HTML',
    //   description: 'Datum der Veröffentlichung (PD): 21-10-2015 | Frist (DT):  | Dokument (TD): Vergebene Aufträge',
    //   pubDate: 'Tue Oct 27 2015 09:01:00 GMT+0100 (CET)',
    //   location: 'Zwickau',
    //   company: 'European Homecare GmbH' },
    // { id: 'http://ted.europa.eu/udl?uri=TED:NOTICE:371061-2015:TEXT:DE:HTML',
    //   title: 'Dienstleistungen des Sozialwesens und zugehörige Dienstleistungen',
    //   link: 'http://ted.europa.eu/udl?uri=TED:NOTICE:371061-2015:TEXT:DE:HTML',
    //   description: 'Datum der Veröffentlichung (PD): 21-10-2015 | Frist (DT):  | Dokument (TD): Vergebene Aufträge',
    //   pubDate: 'Tue Oct 27 2015 09:01:00 GMT+0100 (CET)',
    //   location: 'Zwickau',
    //   company: 'Diakoniewerk Westsachsen gGmbH' },
    // { id: 'http://ted.europa.eu/udl?uri=TED:NOTICE:368475-2015:TEXT:DE:HTML',
    //   title: 'Verpflegungsdienste',
    //   link: 'http://ted.europa.eu/udl?uri=TED:NOTICE:368475-2015:TEXT:DE:HTML',
    //   description: 'Datum der Veröffentlichung (PD): 20-10-2015 | Frist (DT):  | Dokument (TD): Vergebene Aufträge',
    //   pubDate: 'Tue Oct 27 2015 09:01:00 GMT+0100 (CET)',
    //   location: 'Rostock',
    //   company: 'Sodexo SCS GmbH' },
    // { id: 'http://ted.europa.eu/udl?uri=TED:NOTICE:376263-2015:TEXT:DE:HTML',
    //   title: 'Unterricht in berufsbildenden weiterführenden Schulen',
    //   link: 'http://ted.europa.eu/udl?uri=TED:NOTICE:376263-2015:TEXT:DE:HTML',
    //   description: 'Datum der Veröffentlichung (PD): 24-10-2015 | Frist (DT):  | Dokument (TD): Vergebene Aufträge',
    //   pubDate: 'Tue Oct 27 2015 09:01:00 GMT+0100 (CET)',
    //   location: 'Weiden in der Oberpfalz',
    //   company: 'Kolping Bildungswerk Weiden' },
    // { id: 'http://ted.europa.eu/udl?uri=TED:NOTICE:359875-2015:TEXT:DE:HTML',
    //   title: 'Dienstleistungen von Detekteien und Sicherheitsdiensten',
    //   link: 'http://ted.europa.eu/udl?uri=TED:NOTICE:359875-2015:TEXT:DE:HTML',
    //   description: 'Datum der Veröffentlichung (PD): 13-10-2015 | Frist (DT):  | Dokument (TD): Vergebene Aufträge',
    //   pubDate: 'Tue Oct 27 2015 09:01:00 GMT+0100 (CET)',
    //   location: 'Karlsruhe',
    //   company: 'b.i.g sicherheit gmbh, Objekt- und Personenschutz' },
    // { id: 'http://ted.europa.eu/udl?uri=TED:NOTICE:378172-2015:TEXT:DE:HTML',
    //   title: 'Dienstleistungen für Unternehmen: Recht, Marketing, Consulting, Einstellungen, Druck und Sicherheit',
    //   link: 'http://ted.europa.eu/udl?uri=TED:NOTICE:378172-2015:TEXT:DE:HTML',
    //   description: 'Datum der Veröffentlichung (PD): 27-10-2015 | Frist (DT):  | Dokument (TD): Vergebene Aufträge',
    //   pubDate: 'Tue Oct 27 2015 09:01:00 GMT+0100 (CET)',
    //   location: 'Karlsruhe',
    //   company: 'Romak Deutschland GmbH' },
    // { id: 'http://ted.europa.eu/udl?uri=TED:NOTICE:367122-2015:TEXT:DE:HTML',
    //   title: 'Hausmeisterdienste',
    //   link: 'http://ted.europa.eu/udl?uri=TED:NOTICE:367122-2015:TEXT:DE:HTML',
    //   description: 'Datum der Veröffentlichung (PD): 17-10-2015 | Frist (DT):  | Dokument (TD): Vergebene Aufträge',
    //   pubDate: 'Tue Oct 27 2015 09:01:00 GMT+0100 (CET)',
    //   location: 'Peine',
    //   company: 'Dienstleistungen Deike' },
    // { id: 'http://ted.europa.eu/udl?uri=TED:NOTICE:364696-2015:TEXT:DE:HTML',
    //   title: 'Gebäudereinigung',
    //   link: 'http://ted.europa.eu/udl?uri=TED:NOTICE:364696-2015:TEXT:DE:HTML',
    //   description: 'Datum der Veröffentlichung (PD): 16-10-2015 | Frist (DT):  | Dokument (TD): Vergebene Aufträge',
    //   pubDate: 'Tue Oct 27 2015 09:01:00 GMT+0100 (CET)',
    //   location: 'Velbert',
    //   company: 'European Homecare GmbH' },
    // { id: 'http://ted.europa.eu/udl?uri=TED:NOTICE:373242-2015:TEXT:DE:HTML',
    //   title: 'Komplett- oder Teilbauleistungen im Hochbau sowie Tiefbauarbeiten',
    //   link: 'http://ted.europa.eu/udl?uri=TED:NOTICE:373242-2015:TEXT:DE:HTML',
    //   description: 'Datum der Veröffentlichung (PD): 23-10-2015 | Frist (DT):  | Dokument (TD): Vergebene Aufträge',
    //   pubDate: 'Tue Oct 27 2015 09:01:00 GMT+0100 (CET)',
    //   location: 'Leipzig',
    //   company: 'Köster GmbH' },
    // { id: 'http://ted.europa.eu/udl?uri=TED:NOTICE:367151-2015:TEXT:DE:HTML',
    //   title: 'Dienstleistungen des Hotel- und Gaststättengewerbes und des Einzelhandels',
    //   link: 'http://ted.europa.eu/udl?uri=TED:NOTICE:367151-2015:TEXT:DE:HTML',
    //   description: 'Datum der Veröffentlichung (PD): 17-10-2015 | Frist (DT):  | Dokument (TD): Vergebene Aufträge',
    //   pubDate: 'Tue Oct 27 2015 09:01:00 GMT+0100 (CET)',
    //   location: 'Koblenz',
    //   company: 'Sander Catering GmbH' },
    // { id: 'http://ted.europa.eu/TED/rss/CustomRSSFeedGenerator/239154/de/fullSearch',
    //   title: 'Mehr...',
    //   link: 'http://ted.europa.eu/TED/rss/CustomRSSFeedGenerator/239154/de/fullSearch',
    //   description: 'In TED gibt es mehrere Veröffentlichungen, die diese Kriterien erfüllen. Um weitere Informationen zu erhalten, klicken Sie bitte auf den Link',
    //   pubDate: 'Tue Oct 27 2015 09:01:00 GMT+0100 (CET)',
    //   location: '',
    //   company: undefined }
    ];

    for (var key in items) {

        handleItem(items[key]);
    }   

    // for (var key in items) {

    //     items[key].title = beautifyTitle(items[key].title);
    //     items[key].location = getLocation(items[key].title);
    //     items[key].title = removeLocation(items[key].title);
    //     items[key].company = getItemInfo(items[key], handleItem);
    // }
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

    shortenTweet(item, 140, postToTwitter);

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

function shortenTweet(item, length, callback) {

    item.tweet = 'Neuer Auftrag: ' + item.company + ': ' + item.title + ' (' + item.location + '): ' + item.link + ' #asyl';

    if (item.tweet.length > length) {

        var isShortable = true;

        if (item.title && isShortable) {

            var newTitle = item.title.split(' ').slice(0, -1).join(' ');

            if (newTitle.length && newTitle.length < item.title.length) {

                item.title = newTitle;
            } else {

                isShortable = false;
            }
        }

        if (item.company && !isShortable) {

            item.company = item.company.split(' ').slice(0, -1).join(' ');
        }

        shortenTweet(item, length, callback);
    } else {

        callback(item);
    }
}

// post item to twitter
function postToTwitter(item) {

    console.log(item);

    // twitter.post('statuses/update', { status: item.tweet }, function (err, data, res) {
             
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

function clone(obj) {

    return JSON.parse(JSON.stringify(obj));
} 
