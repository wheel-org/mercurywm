/* @flow */

import { createStore } from 'redux';
import reducers from 'background/reducers';
import Storage from 'background/storage';

import type { Store } from 'types';

const store: Store = createStore(reducers, Storage.initialState);

Storage.load(newState => {
  store.dispatch({
    type: 'LOAD_STORAGE',
    data: newState
  });
});

// setInterval(() => store.dispatch({ type: 'TEST' }), 2000);

window.getState = () => store.getState();
window.reset = () => store.dispatch({ type: 'RESET_STORE' });

console.log('MercuryWM background running');

/*
 * request: request object
 * sender: extension info object
 * sendResponse: callback
 */

chrome.runtime.onConnect.addListener(port => {
  console.assert(port.name === 'mercurywm');
  console.log('connected');
  port.postMessage('connected');

  port.onMessage.addListener(msg => {
    const state = store.getState();
    console.log(msg);

    if (!state.loaded) {
      port.postMessage('not ready');
      return;
    }

    switch (msg.command) {
      case 'reset': {
        Storage.clear();
      }
    }
  });
});

/*
When a terminal runs a command, it sets itself to inProg = true, and doesn't allow any input.
In the reducer, the command sends a message to this background script, along with additional
information to identify the terminal such as the window ID.
*/
// const commands = {};
//
// function Command(data, callback) {
//   this.running = true;
//   this.run = () => {
//     // Perform long calculations
//     setTimeout(() => {
//       if (this.running) {
//         callback('goodbye ' + data);
//         this.running = false;
//       }
//     }, 1000);
//   };
//   this.kill = () => {
//     this.running = false;
//   };
// }
