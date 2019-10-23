# Avgang

![Avgang](https://github.com/oysteing/avgang/raw/master/src/img/icon.png)

Avgang lets you know if you have to run for the bus. It shows real-time public transport departure times from Entur on Samsung smart watches.

It is created using the Entur API and a Tizen web application.

## Screenshots

![Screenshots](https://github.com/oysteing/avgang/raw/master/src/img/screenshots.png)

## Requirements
* Tizen SDK (tizen binary available on $PATH)

## Build

```
npm run build
npm run package
npm run deploy
```
Open dist/ in Tizen Studio to debug. Note that you may have to `npm run clean` first if package signature fails.

## Further development

* Add widget
* Entur SDK

## Credits

Big thanks to JetBrains (https://www.jetbrains.com/?from=Avgang) for supporting the project with WebStorm licenses!
![JetBrains](https://github.com/oysteing/avgang/raw/master/src/img/jetbrains.svg?sanitize=true)