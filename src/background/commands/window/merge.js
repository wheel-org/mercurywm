/* @flow strict */

import type { StoreState } from 'types';

/* Merge */
function canMerge(a, b) {
  if (
    a.x === b.x &&
    a.width === b.width &&
    (a.y + a.height === b.y || b.y + b.height === a.y)
  ) {
    // vertical merge
    a.y = Math.min(a.y, b.y);
    a.height += b.height;
    return true;
  } else if (
    a.y === b.y &&
    a.height === b.height &&
    (a.x + a.width === b.x || b.x + b.width === a.x)
  ) {
    // horizontal merge
    a.x = Math.min(a.x, b.x);
    a.width += b.width;
    return true;
  }
  return false;
}

export default function merge(state: StoreState, params: Array<string>) {
  console.log(this);
  if (params[1] === 'all') {
    this.workspace.windows = [
      {
        ...this.workspace.windows[this.windowIndex],
        width: 100,
        height: 100,
        x: 0,
        y: 0
      }
    ];
  } else if (params.length === 2) {
    const index = parseInt(params[1]);
    if (
      index >= 0 &&
      index < this.workspace.windows.length &&
      canMerge(
        this.workspace.windows[this.windowIndex],
        this.workspace.windows[index]
      )
    ) {
      this.workspace.windows.splice(index, 1);
    } else {
      this.output('Cannot merge ' + params[1]);
    }
  } else if (params.length === 3) {
    const firstIndex = parseInt(params[1]);
    const secondIndex = parseInt(params[2]);

    if (firstIndex === secondIndex) {
      this.output('Windows must be distinct');
    } else if (
      firstIndex >= 0 &&
      firstIndex < this.workspace.windows.length &&
      secondIndex >= 0 &&
      secondIndex < this.workspace.windows.length &&
      canMerge(
        this.workspace.windows[firstIndex],
        this.workspace.windows[secondIndex]
      )
    ) {
      this.workspace.windows.splice(secondIndex, 1);
    } else {
      this.output('Cannot merge ' + params[1]);
    }
  } else {
    this.output('Invalid number of parameters');
  }

  return state;
}
