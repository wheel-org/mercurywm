/* @flow strict */

import {
  getBorderingBottom,
  getBorderingLeft,
  getBorderingRight,
  getBorderingTop
} from 'utils';

import type { StoreState } from 'types';

export default function fix(state: StoreState, params: Array<string>) {
  const windows = this.workspace.windows;
  const current = this.currWindow;

  if (params[0] === 'fixw') {
    // Fix Width

    result = getBorderingLeft(this.windowIndex, windows);
  }
  else if (params[0] === 'fixh') {
    result = getBorderingRight(this.windowIndex, windows);
  }

  return state;
}
