/* @flow strict */

import u from 'updeep';

import type { StoreState } from 'types';

// Updates should be safe to perform even for updated users
const updates = {
  '2.0.0': (state: StoreState) =>
    u(
      {
        wsh: {
          aliases: aliases => (typeof aliases === 'object' ? aliases : {})
        }
      },
      state
    )
};

// List of all version strings
// The last version in the list must be the current version in package.json
const versions = ['1.0.0', '1.1.0', '2.0.0', '2.0.1'];

export default function updateState(state: StoreState): StoreState {
  let index = versions.findIndex(v => v === state.version);
  // Invalid version string; try all updates
  if (index === -1) {
    // $FlowFixMe: mutating state
    state.version = '1.0.0';
  }

  // Keep applying updaters until the state is at the latest version
  while (index < versions.length) {
    const update = updates[state.version];
    if (update) {
      // $FlowFixMe: mutating state
      state = update(state);
    }

    // There may be an update applied during the latest version (during development).
    // Since the next version string isn't set, keep the version string the same.
    if (state.version !== Constants.VERSION) {
      // $FlowFixMe: mutating state
      state.version = versions[index + 1];
    }

    index++;
  }

  return state;
}
