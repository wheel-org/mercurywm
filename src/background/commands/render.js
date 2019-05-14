/* @flow strict */

import { getFile } from 'utils';

import type { StoreState } from 'types';

export default function render(state: StoreState, params: Array<string>) {
  let hadError = false;
  let alreadyEncounteredHtml = false;
  for (let i = 0; i < params.length; i++) {
    if (params[i].endsWith('.html')) {
      if (alreadyEncounteredHtml) {
        this.output('Encountered two HTML files! Can only load one with render.');
        hadError = true;
        break;
      }
      else {
        alreadyEncounteredHtml = true;
      }
    }
    if (!(params[i].endsWith('.html') ||
          params[i].endsWith('.css') ||
          params[i].endsWith('.js'))) {
      this.output('Files must be .html, .js, or .css!');
      hadError = true;
      break;
    }
    if (!getFile(params[i], state.wfs, this.terminal.workingDirectory)) {
      this.output('File ' + params[i] + ' does not exist!');
      hadError = true;
      break;
    }
  }
  if (!hadError) {
    this.terminal.runningCommand = 'render';
    this.terminal.isExtension = true;
    this.terminal.params = params;
  }
  return state;
}
