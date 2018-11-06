/* @flow strict */

import type { StoreState } from 'types';

export default function backup(state: StoreState, params: Array<string>) {
  if (params.length === 1) {
    if (params[0] === 'save') {
      // Can't use window.prompt for user to copy backup since
      // default string is limited to 2000 characters on Chrome
      const data = btoa(encodeURI(JSON.stringify(state)));
      this.output('Check your browser console!');
      console.log('Save the following string as a backup:');
      console.log(data);
    } else if (params[0] === 'restore') {
      try {
        const data = window.prompt('Paste the backup string below:');
        const newState = JSON.parse(decodeURI(atob(data)));
        if (newState && typeof newState === 'object') {
          return newState;
        }
      } catch (e) {
        console.log(e);
        this.output('Not valid JSON');
      }
    } else {
      this.output('Unknown parameter: ' + params[0]);
    }
  } else {
    this.output('Invalid number of parameters');
  }
  return state;
}
