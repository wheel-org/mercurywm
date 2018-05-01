/* @flow */

import { getFile } from 'utils';

import type { StoreState } from 'types';

export default function render(state: StoreState, params: Array<string>) {
  if (params.length === 0) {
    this.terminal.runningCommand = 'render';
    this.terminal.isExtension = true;
    this.terminal.params = params;
  }
  else if (params.length === 1) {
    // Load only HTML file
    if (getFile(params[0], state.wfs, this.terminal.workingDirectory)) {
      this.terminal.runningCommand = 'render';
      this.terminal.isExtension = true;
      this.terminal.params = params;
    }
    else {
      this.output('File ' + params[0] + ' does not exist');
    }
  } else if (params.length === 2) {
    // Load HTML + JS
    if (
      getFile(params[0], state.wfs, this.terminal.workingDirectory) &&
      getFile(params[1], state.wfs, this.terminal.workingDirectory)
    ) {
      this.terminal.runningCommand = 'render';
      this.terminal.isExtension = true;
      this.terminal.params = params;
    }
    else {
      this.output('Files ' + params[0] + ' or ' + params[1] + ' does not exist');
    }
  } else {
    this.output('Invalid number of parameters');
  }
  return state;
}
