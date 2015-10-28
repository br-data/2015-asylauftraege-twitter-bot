# Asylaufträge Twitter-Bot
Der Bot twittert neue Großaufträge im Bereich Flüchtlinge/Asyl, welche aus der europäischen Ausschreibedatenbank (TED) bezogen werden. TED bietet einen RSS-Feed zu speziellen Themen und Anfragen an. Dieser RSS-Feed wird gescrapt und neue Beiträge getwittert.

*Live:* Twitter-Account [@asylauftraege](https://twitter.com/asylauftraege)

### Verwendung
1. Repository klonen `git clone https://...`
2. Erforderliche Module installieren `npm install`
3. `node app.js` ausführen, um den Scraper zu starten

### Live
Die Anwendung liegt unter '/var/www/app/asylindustrie-twitter-bot/' auf dem BR Data Server und wird einmal täglich von einem Jenkins Job ausgeführt.
