/* @flow strict */

import type { StoreState } from 'types';

export default function reload(state: StoreState, params: Array<string>) {
  chrome.runtime.reload();
  return state;
}
