/* @flow */

import executeScript from './scripts';
import { isCommand } from './commands/index';
import { clear } from './storage';
import store from './store';

import type { Action } from 'types';

window.getState = () => store.getState();
window.reset = () => {
  clear();
  chrome.runtime.reload();
};

console.log('MercuryWM background running');

chrome.runtime.onConnect.addListener(port => {
  console.assert(port.name === 'mercurywm');
  console.log('connected');
  port.postMessage('connected');

  port.onMessage.addListener((action: Action) => {
    const state = store.getState();

    if (!state.loaded) {
      port.postMessage('Background not ready');
      return;
    }

    store.dispatch(action);

    if (action.type === 'EXECUTE_COMMAND') {
      const [command] = action.text.split(' ');
      if (!isCommand(command)) {
        // Run the script async
        executeScript(state.selectedWindow, action.text);
      }
    }
  });

  port.onDisconnect.addListener(() => {
    console.log('disconnect');
  });
});
