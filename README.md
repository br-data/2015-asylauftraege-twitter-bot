# Asylaufträge Twitter-Bot
Der Bot [@asylauftraege](https://twitter.com/asylauftraege) twittert die Großaufträge deutscher Behörden, die im Zusammenhang mit Flüchtlingen und Asylbewerbern stehen und an private Firmen vergeben werden. Diese Großaufträge werden im europäischen Ausschreibungsverzeichnis [TED](http://ted.europa.eu) veröffentlicht. TED bietet einen [RSS-Feed](http://ted.europa.eu/TED/rss/CustomRSSFeedGenerator/239154/de) zu speziellen Themen und Anfragen an. Dieser RSS-Feed wird gescrapt und neue Einträge getwittert.

**Artikel** http://www.br.de/extra/br-data/asyl-grossauftraege-karte-100.html
**FAQ:** http://www.br.de/extra/br-data/twitter-bot-asylauftraege-100.html
**Twitter:** [@asylauftraege](https://twitter.com/asylauftraege)

### Verwendung
1. Repository klonen `git clone https://...`
2. Erforderliche Module installieren `npm install`
3. `node app.js` ausführen, um den Scraper zu starten

### Live
Die Anwendung liegt unter '/var/www/app/asylauftraege-twitter-bot/' auf dem BR Data Server und wird einmal täglich von einem Jenkins Job ausgeführt.

### Mögliche Verbesserungen
- Der Zeitpunkt des letzten Scrapings wird momentan noch in die Textdatei `lastPostedDate.txt` gespeichert. Im Idealfall wird dieser Wert in einer Datenbank (MongoDB) gespeichert.
- Die Logs, neue Tweets, Fehler etc. werden momentan nur von Jenkins gespeichert. Im Idealfall laufen auch diese in eine Datenbank ein.
- Manchmal wird versucht einen Eintrag doppelt zu twittern, da das Datum des Auftrag nicht stimmt oder zu ungenau ist. Twitter verhindert jedoch das Doppelposten. 
