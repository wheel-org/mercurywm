/* @flow */

import merge from './merge';
import shift from './shift';
import split from './split';

import type { StoreState } from 'types';

export default function window(state: StoreState, params: Array<string>) {
  if (params.length === 0) {
    this.output('Invalid number of parameters');
    return state;
  }

  switch (params[0]) {
    case 'vs':
    case 'hs':
      return split.call(this, state, params);
    case 'merge':
      return merge.call(this, state, params);
    case 'left':
    case 'right':
    case 'top':
    case 'bottom':
      return shift.call(this, state, params);
    case 'list':
      this.output('In this workspace:');
      this.workspace.windows.forEach(({ terminal }, i) => {
        let outputString = '[' + i + '] ';
        if (terminal.running) {
          outputString +=
            'Running: ' +
            terminal.runningCommand +
            ' ' +
            terminal.params.join(' ');
        } else {
          outputString += 'Idle';
        }
        this.output(outputString);
      });
      return state;
    default:
      this.output('Unknown parameter ' + params[0]);
      return state;
  }
}
