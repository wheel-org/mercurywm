/* @flow */

import store from './store';

import type { StoreState } from 'types';

const port = chrome.runtime.connect(undefined, { name: 'mercurywm' });
port.onMessage.addListener(msg => {
  console.log(msg);
  // port.postMessage({ answer: 'Madame' });
});

function parseInput(text): Array<string> {
  const tokens = text.trim().match(/[^\s"']+|"([^"]*)"|'([^']*)'/g);
  if (tokens)
    return tokens.map(t => t.replace(/^"|"$/g, '').replace(/^'|'$/g, ''));
  return [];
}

function executeCommand(state: StoreState, input: string) {
  const [command, ...params] = parseInput(input);

  port.postMessage({command, params});
}

export default executeCommand;
