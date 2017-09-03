# MercuryWM <img src="build/icon128.png" alt="MercuryWM icon" width="32" height="32" />
MercuryWM is a Chrome extension that transforms your new tab page into a multi-windowed terminal environment.

## Build
- `git clone https://github.com/wheel-org/mercurywm.git`
- `npm install`
- `npm run webpack`
  - This will also make webpack to watch for changes and rebuild on save

To build a production version, run `npm run prod`.

To run the extension, load the `build` directory into Chrome and open a new tab.

![Screenshot of MercuryWM](screenshot.png)
