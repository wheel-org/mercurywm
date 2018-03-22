/* @flow */

import { createStore } from 'redux';
import reducers from 'background/reducers';
import Storage from 'background/storage';

import type { Store, Action } from 'types';

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
      // Run the commmand async
      const id = state.selectedWindow;
      const [command, ...params] = parseInput(action.text);
    }
    else if (action.type === 'KILL_SCRIPT') {
      // Kill the command
      const id = action.id;
    }
  });
});


// Parse input into command and parameters
function parseInput(text): Array<string> {
  const tokens = text.trim().match(/[^\s"']+|"([^"]*)"|'([^']*)'/g);
  if (tokens)
    return tokens.map(t => t.replace(/^"|"$/g, '').replace(/^'|'$/g, ''));
  return [];
}


/*
When a terminal runs a command, it sets itself to running = true, and doesn't allow any input.
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
