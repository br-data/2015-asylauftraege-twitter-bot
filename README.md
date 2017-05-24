# Asylaufträge Twitter-Bot
Der Bot [@asylauftraege](https://twitter.com/asylauftraege) twittert die Großaufträge deutscher Behörden, die im Zusammenhang mit Flüchtlingen und Asylbewerbern stehen und an private Firmen vergeben werden. Diese Großaufträge werden im europäischen Ausschreibungsverzeichnis [TED](http://ted.europa.eu) veröffentlicht. TED bietet einen [RSS-Feed](http://ted.europa.eu/TED/rss/CustomRSSFeedGenerator/239154/de) zu speziellen Themen und Anfragen an. Dieser RSS-Feed wird gescrapt und neue Einträge ([Beispiel](http://ted.europa.eu/udl?uri=TED:NOTICE:330691-2016:TEXT:DE:HTML)) getwittert.

- **Artikel** http://www.br.de/extra/br-data/asyl-grossauftraege-karte-100.html
- **FAQ:** http://www.br.de/extra/br-data/twitter-bot-asylauftraege-100.html
- **Twitter:** [@asylauftraege](https://twitter.com/asylauftraege)

## Verwendung
1. Repository klonen `git clone https://...`
2. Erforderliche Module installieren `npm install`
3. `node app.js` ausführen, um den Scraper zu starten

## Konfiguration
Alle Einstellungen finden sich in der Datei `config.js`. Dort müssen die URL des RSS-Feeds und die Twitter-API-Keys hinterlegt werden. Einen Twitter-API-Key bekommt man, wenn man einen neue Anwendung auf [apps.twitter.com](https://apps.twitter.com/) registriert. Die hier verwendeten Keys dienen nur der Demonstration und funktionieren nicht.

```javascript
module.exports = {

    RSS_FEED: 'http://ted.europa.eu/TED/rss/CustomRSSFeedGenerator/239154/de',

    CONSUMER_KEY: 'uxgsMdpGxMlWrsz7HToHfdXeF',
    CONSUMER_SECRET: 'KaZwjigNLSqM7Oa7jb18JDqP79LMV7192byivUmnFE81cHyYFQ',
    ACCESS_TOKEN: '7098423202-A1zN0IpLmN1P8Hrm4rXJUR4YwgzayxOueTOuPno',
    ACCESS_TOKEN_SECRET: 'PZihMCeFw6c5cup91HxdCJtV73l3LNmZcAd7anZxhBAIh'
}
```

## Deployment
Um den Twitter-Bot in einer Live-Umgebung zu verwenden, empfiehlt es sich eine neue Konfiguration anzulegen `config/ config.production.js`. Dort werden die Twitter-API-Keys für den Live-Betrieb festgelegt.

Um den Bot mit den Live-Konfiguration zu starten, muss die Umgebungsvariable `NODE_ENV` gesetzt werden:

```
$ NODE_ENV=production node app.js
```

Um den Twitter-Bot regelmäßig zu starten, verwenden wir [Jenkis](https://jenkins.io/).

## Mögliche Verbesserungen
- Der Zeitpunkt des letzten Scrapings wird momentan noch in die Textdatei `lastPostedDate.txt` gespeichert. Im Idealfall wird dieser Wert in einer Datenbank (MongoDB) gespeichert.
- Die Logs, neue Tweets, Fehler etc. werden momentan nur von Jenkins gespeichert. Im Idealfall laufen auch diese in eine Datenbank ein.
- Manchmal wird versucht einen Eintrag doppelt zu twittern, da das Datum des Auftrag nicht stimmt oder zu ungenau ist. Twitter verhindert jedoch das Doppelposten. 
