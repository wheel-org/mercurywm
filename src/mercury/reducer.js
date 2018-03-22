/* @flow */

import dispatchToBackground from './background';

import type { StoreState, Action } from 'types';

const reducer = (state: StoreState, action: Action) => {
  if (action.type === 'LOAD_STORAGE') {
    return { ...action.data };
  }

  // TODO: is this check necessary?
  if (state.loaded) {
    // Send action to background
    dispatchToBackground(action);
  }

  return state;
};

export default reducer;
