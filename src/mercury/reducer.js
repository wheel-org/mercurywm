/* @flow strict */

import { dispatchToBackground } from './background';
import { initialState } from './store';

import type { StoreState, Action } from 'types';

const reducer = (
  state: StoreState = initialState,
  action: Action
): StoreState => {
  if (action.type === 'LOAD_STORAGE') {
    return { ...action.data };
  }

  if (state.loaded) {
    // Send action to background
    dispatchToBackground(action);
  }

  return state;
};

export default reducer;
