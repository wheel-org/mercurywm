/* @flow */

import type { StoreState } from 'types';

export default function env(state: StoreState, params: Array<string>) {
  if (params.length === 0) {
    Object.keys(state.wsh.env).forEach(e => {
      this.output(e + ': ' + state.wsh.env[e], false, false);
    });
  } else if (params.length === 1) {
    this.output(params[0] + ': ' + state.wsh.env[params[0]], false, false);
  } else if (params.length === 2) {
    // $FlowFixMe: command can mutate state
    state.wsh.env[params[0]] = params[1];
  } else {
    this.output('Invalid number of parameters');
  }
  return state;
}
