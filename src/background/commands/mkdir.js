/* @flow */

import {createDirectory} from 'creators.js';
import { getDirectory } from 'utils';

import type { StoreState } from 'types';

export default function mkdir(state: StoreState, params: Array<string>) {
  if (params.length === 1) {
    const dir = getDirectory(params[0], this.terminal.workingDirectory);
    if (dir) {
      this.output(params[0] + ': Directory already exists');
    } else {
      const path = this.terminal.workingDirectory + '/' + params[0];
      this.traversePath(state.wfs, path.split('/'), (directory, dirName) => {
        const dirIndex = directory.data.findIndex(
          item => item.type == Constants.DIR_TYPE && item.name === dirName
        );
        if (dirIndex === -1) {
          directory.data.push(createDirectory(dirName));
        }
      });
    }
  } else {
    this.output('Invalid number of parameters');
  }
  return state;
}
