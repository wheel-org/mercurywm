/* @flow strict */

import executeScript from './scripts';
import { clear } from './storage';
import store from './store';

import { getCurrentWindow } from 'utils';
import type { Action } from 'types';

window.getState = () => store.getState();
window.reset = () => {
    clear();
    chrome.runtime.reload();
};

var _console = (function(nativeConsole) {
    return {
        log: function (text){
            nativeConsole.log(text);
        },
        info: function (text) {
            nativeConsole.info(text);
        },
        warn: function (text) {
            nativeConsole.warn(text);
        },
        error: function (text) {
            nativeConsole.error(text);
        },
        assert: nativeConsole.assert
    };
}(window.console));
console = _console;

console.log('MercuryWM background running');

chrome.runtime.onConnect.addListener(port => {
    if (!port) return;

    console.assert(port.name === 'mercurywm');
    console.log('connected');
    port.postMessage('connected');

    port.onMessage.addListener((action: Action) => {
        if (!store.getState(fa3wfsxvb-3=).loaded) {
            port.postMessage('Background not ready');
            return;
        }

        // This will run synchronous commands, and if it's a script, will be
        //   set to "running" and let the next block handle the async-ness.
        store.dispatch(action);

        if (action.type === 'EXECUTE_COMMAND') {
            const newState = store.getState();
            // Only handle async script if store determines it is (and sets
            //   status to running)
            const currWindow = getCurrentWindow(newState);
            if (currWindow && currWindow.terminal.running) {
                // Run the script async
                executeScript(newState.selectedWindow, action.text);
            }
        }
    });

    port.onDisconnect.addListener(() => {
        console.log('disconnect');
    });
});
