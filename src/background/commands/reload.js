/* @flow strict */

import type { StoreState } from 'types';

export default function reload(state: StoreState, params: Array<string>) {
  // TODO: maybe refresh the page?
  this.output("Cannot reload in embed MercuryWM");
  return state;
}
