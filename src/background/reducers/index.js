/* @flow */

import { save, clear } from 'background/storage';

import type { StoreState, Action } from 'types';

const rootReducer = function(state: StoreState, action: Action): StoreState {
  console.log(action);
  switch (action.type) {
    case 'LOAD_STORAGE':
      return {
        ...action.data,
        loaded: true
      };
    case 'RESET_STORE':
      return clear();
    case 'TEST':
      return {
        ...state,
        wsh: {
          ...state.wsh,
          env: {
            ...state.wsh.env,
            test: state.wsh.env.test ? state.wsh.env.test + 1 : '1'
          }
        }
      };
    default:
      return state;
  }
};

const saveWrapper = function(state: StoreState, action: Action) {
  const newState = rootReducer(state, action);
  save(newState);
  return newState;
};

export default saveWrapper;
