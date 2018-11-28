/* @flow strict */

import type { Action } from 'types';

let worker;
let dispatchToBackground;

if (process.env.MERCURY_TARGET === 'web') {
  const w = new Worker('background.js');
  worker = w;

  dispatchToBackground = (action: Action) => {
    w.postMessage(action);
  };
} else {
  worker = null;

  const port = chrome.runtime.connect(
    undefined,
    { name: 'mercurywm' }
  );
  port.onMessage.addListener(msg => {
    console.log(msg);
  });

  dispatchToBackground = (action: Action) => {
    port.postMessage(action);
  };
}

export { worker, dispatchToBackground };
