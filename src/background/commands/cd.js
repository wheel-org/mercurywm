/* @flow */

import { getPath, getDirectory } from 'utils';

import type { StoreState } from 'types';

export default function cd(state: StoreState, params: Array<string>) {
  if (params.length === 0) {
    this.terminal.workingDirectory = '~';
  } else if (params.length === 1) {
    const dir = getDirectory(
      params[0],
      state.wfs,
      this.terminal.workingDirectory
    );
    if (dir) {
      const path = getPath(
        params[0],
        state.wfs,
        this.terminal.workingDirectory
      );
      this.terminal.workingDirectory = path;
    } else {
      this.output('No such directory ' + params[0]);
    }
  } else {
    this.output('Invalid number of parameters');
  }
  return state;
}
