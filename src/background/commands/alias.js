/* @flow strict */

import type { StoreState } from 'types';

/* This command has essentially the same logic as env.js */
export default function alias(state: StoreState, params: Array<string>) {
  if (!state.wsh.aliases) {
      state.wsh.aliases = {};
  }
  if (params.length === 0) {
    Object.keys(state.wsh.aliases).forEach(e => {
        this.output(e + ': ' + state.wsh.aliases[e], false, false);
    });
  } else if (params.length === 1) {
    this.output(params[0] + ': ' + state.wsh.aliases[params[0]], false, false);
  } else if (params.length === 2) {
    // $FlowFixMe: command can mutate state
    if (!params[1]) {
      delete state.wsh.aliases[params[0]];
    } else {
      state.wsh.aliases[params[0]] = params[1];
    }
  } else {
    this.output('Invalid number of parameters');
  }
  return state;
}
