/* @flow strict */

import { createWorkspace } from 'creators';

import type { StoreState } from 'types';

export default function workspace(state: StoreState, params: Array<string>) {
  if (params.length === 1) {
    if (params[0] === 'add') {
      state.workspaces.push(createWorkspace(Date.now()));
    } else {
      const index = parseInt(params[0]);
      if (index >= 0 && index < state.workspaces.length) {
        // $FlowFixMe: command can mutate state
        state.selectedWorkspace = index;
        // $FlowFixMe: command can mutate state
        state.selectedWindow = state.workspaces[index].windows[0].id;
      } else {
        this.output('Unknown parameter ' + params[0]);
      }
    }
  } else if (params.length === 2) {
    if (params[0] === 'remove') {
      const index = parseInt(params[1]);
      if (index < 0 || index >= state.workspaces.length) {
        this.output('Invalid workspace id ' + params[1]);
      } else if (state.workspaces.length === 1) {
        this.output('Cannot have zero workspaces');
      } else {
        if (index === state.selectedWorkspace) {
          // $FlowFixMe: command can mutate state
          state.selectedWorkspace = 0;
          // $FlowFixMe: command can mutate state
          state.selectedWindow = state.workspaces[0].windows[0].id;
        }
        state.workspaces.splice(index, 1);
      }
    } else {
      this.output('Unknown parameter ' + params[0]);
    }
  } else {
    this.output('Invalid number of parameters');
  }
  return state;
}
