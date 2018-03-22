/* @flow */

import dispatchToBackground from './background';

import type { StoreState, Action } from 'types';

const reducer = (state: StoreState, action: Action) => {
  console.log(action);
  if (action.type === 'LOAD_STORAGE') {
    return { ...action.data };
  }

  if (!state.loaded) {
    return state;
  }

  // Send action to background
  dispatchToBackground(action);
  return state;
};

export default reducer;
