/* @flow */

import Constants from 'constants.js';
import { getDirectory } from 'utils';

import type { StoreState } from 'types';

export default function ls(state: StoreState, params: Array<string>) {
  const showHidden = params.length > 0 && params[0] === '-a';

  const workingDirectory = getDirectory(this.terminal.workingDirectory);
  if (!workingDirectory) return state; // Should always exist

  if (workingDirectory.data.length === 0) {
    this.output('Directory is empty');
    return state;
  }

  this.output('Directory listing for ' + this.terminal.workingDirectory);

  // Sort by type and name
  workingDirectory.data
    .slice()
    .sort((a, b) => {
      if (a.type === Constants.DIR_TYPE && b.type !== Constants.DIR_TYPE) {
        return -1;
      }
      if (a.type !== Constants.DIR_TYPE && b.type === Constants.DIR_TYPE) {
        return 1;
      }
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    })
    .forEach(item => {
      if (item.name[0] !== '.' || showHidden) {
        if (item.type === Constants.DIR_TYPE) {
          this.output('DIR     ' + item.name, false, false);
        } else if (item.type === Constants.FILE_TYPE) {
          this.output('FILE    ' + item.name, false, false);
        } else if (item.type === Constants.EXE_TYPE) {
          this.output('EXE     ' + item.name, false, false);
        }
      }
    });

  return state;
}
