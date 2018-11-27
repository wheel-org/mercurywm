/* @flow strict */

import type { Action } from 'types';

export const worker = new Worker('background.js');

function dispatchToBackground(action: Action) {
  worker.postMessage(action);
}

export default dispatchToBackground;
