/* @flow */

import Constants from 'constants.js';
import { getFile, getDirectory, getPath } from 'utils';

import type { StoreState } from 'types';

export default function rm(state: StoreState, params: Array<string>) {
  if (params.length !== 1 && params.length !== 2) {
    this.output('Invalid number of parameters');
    return state;
  }

  if (params.length === 1) {
    const path = getPath(params[0], this.terminal.workingDirectory);

    if (getFile(path)) {
      this.deleteFile(path);
    } else if (getDirectory(path)) {
      this.deleteDirectory(path);
    } else {
      this.output(params[0] + ' was not found');
    }
  } else {
    const path = getPath(params[1], this.terminal.workingDirectory);

    if (params[0] === '-f') {
      if (getFile(path)) {
        this.deleteFile(path);
      } else {
        this.output('File ' + params[1] + ' was not found');
      }
    } else if (params[0] === '-d') {
      if (getDirectory(path)) {
        this.deleteDirectory(path);
      } else {
        this.output('Directory ' + params[1] + ' was not found');
      }
    } else {
      this.output(params[0] + ' is an invalid flag');
    }
  }

  return state;
}
