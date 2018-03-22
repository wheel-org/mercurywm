/* @flow */

import { getFile } from 'utils';

import type { StoreState } from 'types';

export default function cat(state: StoreState, params: Array<string>) {
  if (params.length === 1) {
    const navResult = getFile(params[0], this.terminal.workingDirectory);
    if (!navResult) {
      this.output(params[0] + ' was not found');
    } else {
      this.output(navResult.data, false, false);
    }
  } else {
    this.output('Invalid number of parameters');
  }
  return state;
}
