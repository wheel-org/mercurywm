/* @flow */

import executeScript, { isBuiltIn } from './scripts';
import store from './store';
import { clear } from './storage';

import type { Action } from 'types';

window.getState = () => store.getState();
window.reset = () => clear();

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

    // Check for builtin?
    if (action.type === 'EXECUTE_COMMAND') {
      const [command] = action.text.split(' ');
      if (command && !isBuiltIn(command)) {
        // Run the script async
        executeScript(state.selectedWindow, action.text);
      }
    }
  });

  port.onDisconnect.addListener(() => {
    console.log('disconnect');
  });
});
