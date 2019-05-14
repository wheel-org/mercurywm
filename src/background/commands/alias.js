/* @flow strict */

import type { StoreState } from 'types';

/* This command has essentially the same logic as env.js */
export default function alias(state: StoreState, params: Array<string>) {
  if (!state.wsh.aliases) {
    // $FlowFixMe: Users with old versions of MercuryWM won't have 'aliases'.
    state.wsh.aliases = {};
  }
  if (params.length === 0) {
    Object.keys(state.wsh.aliases).forEach(e => {
      state.wsh.aliases &&
        this.output(e + ': ' + state.wsh.aliases[e], false, false);
    });
  } else if (params.length === 1) {
    if (!state.wsh.aliases[params[0]]) {
      this.output("'" + params[0] + "' is not aliased to anything!");
    } else {
      this.output(
        params[0] + ': ' + state.wsh.aliases[params[0]],
        false,
        false
      );
    }
  } else if (params.length === 2) {
    if (!params[1]) {
      delete state.wsh.aliases[params[0]];
    } else {
      // $FlowFixMe: command can mutate state
      state.wsh.aliases[params[0]] = params[1];
    }
  } else {
    this.output('Invalid number of parameters');
  }
  return state;
}
