/* @flow */

import executeScript from 'background/scripts';
import store from 'background/store';

import type { Action } from 'types';

window.getState = () => store.getState();
window.reset = () => store.dispatch({ type: 'RESET_STORE' });

console.log('MercuryWM background running');

chrome.runtime.onConnect.addListener(port => {
  console.assert(port.name === 'mercurywm');
  console.log('connected');
  port.postMessage('connected');

  port.onMessage.addListener((action: Action) => {
    const state = store.getState();

    if (!state.loaded) {
      port.postMessage('not ready');
      return;
    }

    store.dispatch(action);

    if (action.type === 'EXECUTE_COMMAND') {
      // Run the script async
      executeScript(state.selectedWindow, action.text);
    }
  });

  port.onDisconnect.addListener(() => {
    console.log('disconnect');
  });
});
