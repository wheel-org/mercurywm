/* @flow */

import type { StoreState } from 'types';

export default function kill(state: StoreState, params: Array<string>) {
  if (params.length === 1) {
    const index = parseInt(params[0]);
    if (index >= 0 && index < this.workspace.windows.length) {
      if (this.workspace.windows[index].terminal.running) {
        this.workspace.windows[index].terminal.running = false;
        this.output('Extension killed');
      } else {
        this.output('Nothing running in window');
      }
    } else {
      this.output('Invalid parameter');
    }
  } else {
    this.output('Invalid number of parameters');
  }
  return state;
}
