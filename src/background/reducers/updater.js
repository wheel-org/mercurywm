/* @flow strict */

import type { StoreState } from 'types';

const updates = {
  '2.0.0': state => ({
    ...state,
    aliases: {}
  })
};

// List of all version strings
const versions = ['1.0.0', '1.1.0', '2.0.0', '2.1.0'];

function updateState(state: $Shape<StoreState>): StoreState {
  // Missing version string; try all updates
  if (!state.version) {
    // $FlowFixMe: mutating state
    state.version = '1.0.0';
  }

  // While the state isn't updated to the latest version, keep applying updates
  while (state.version !== Constants.VERSION) {
    const index = versions.findIndex(v => v === state.version);
    if (index === -1) {
      // Invalid version string; try all updates
      // $FlowFixMe: mutating state
      state.version = '1.0.0';
    } else {
      const update = updates[state.version];
      if (update) {
        // $FlowFixMe: mutating state
        state = update(state);
      }

      // $FlowFixMe: mutating state
      state.version = versions[index + 1];
    }
  }

  return state;
}
