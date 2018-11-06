/* @flow strict */

import {
  getBorderingBottom,
  getBorderingLeft,
  getBorderingRight,
  getBorderingTop
} from 'utils';

import type { StoreState } from 'types';

// edge is one of left, right, top, or bottom
// c is 1 for +, -1 for -
function getChangeMatrix(edge, c) {
  // c is current, r is rest, d is delta
  // returns [dcx, dcy, dcw, dch, drx, dry, drw, drh]
  if (edge === 'left') {
    return [-c, 0, c, 0, 0, 0, -c, 0];
  } else if (edge === 'right') {
    return [0, 0, c, 0, c, 0, -c, 0];
  } else if (edge === 'top') {
    return [0, -c, 0, c, 0, 0, 0, -c];
  } else {
    return [0, 0, 0, c, 0, c, 0, -c];
  }
}

export default function shift(state: StoreState, params: Array<string>) {
  const windows = this.workspace.windows;

  let result;
  if (params[0] === 'left') {
    result = getBorderingLeft(this.windowIndex, windows);
  } else if (params[0] === 'right') {
    result = getBorderingRight(this.windowIndex, windows);
  } else if (params[0] === 'top') {
    result = getBorderingTop(this.windowIndex, windows);
  } else {
    // params[0] is guaranteed to be 'bottom' by now
    result = getBorderingBottom(this.windowIndex, windows);
  }

  if (result.length !== 0) {
    const change =
      params[1] === '+' ? 1 : params[1] === '-' ? -1 : parseInt(params[1]);

    const c = getChangeMatrix(params[0], change);
    this.currWindow.x += c[0];
    this.currWindow.y += c[1];
    this.currWindow.width += c[2];
    this.currWindow.height += c[3];
    result.map(id => {
      windows[id].x += c[4];
      windows[id].y += c[5];
      windows[id].width += c[6];
      windows[id].height += c[7];
    });
  } else {
    this.output('Cannot shift ' + params[0] + ' border');
  }

  return state;
}
