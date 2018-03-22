/* @flow */

import store from './store';

import type { StoreState, Action } from 'types';

const port = chrome.runtime.connect(undefined, { name: 'mercurywm' });
port.onMessage.addListener(msg => {
  console.log(msg);
  // port.postMessage({ answer: 'Madame' });
});

function dispatchToBackground(action: Action) {
  port.postMessage(action);
}

export default dispatchToBackground;
