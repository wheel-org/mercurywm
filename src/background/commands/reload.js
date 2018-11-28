/* @flow strict */

import type { StoreState } from 'types';

export default function reload(state: StoreState, params: Array<string>) {
  if (process.env.MERCURY_TARGET === 'web') {
    // TODO: maybe refresh the page?
    this.output('Cannot reload in embed MercuryWM');
  } else {
    chrome.runtime.reload();
  }
  return state;
}
