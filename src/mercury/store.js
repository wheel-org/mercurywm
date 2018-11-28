/* @flow strict */

import { worker } from './background';
import { createDirectory } from 'creators';
import reducer from 'mercury/reducer';
import { createStore } from 'redux';

import type { StorageState, StoreState, Store } from 'types';

// Not actual valid state since real state will be taken from storage
const defaultStateObject: StorageState = {
  [Constants.STATE_KEY]: {
    loaded: false,
    workspaces: [],
    wfs: createDirectory('~', []),
    wsh: {
      env: {},
      aliases: {}
    },
    selectedWindow: 0,
    selectedWorkspace: 0,
    version: ''
  }
};

const store: Store = createStore(
  reducer,
  defaultStateObject[Constants.STATE_KEY]
);

if (process.env.MERCURY_TARGET === 'web') {
  if (worker != null) {
    worker.onmessage = e => {
      // $FlowFixMe: worker (background) messages are always state updates
      const newState: StoreState = e.data;
      store.dispatch({
        type: 'LOAD_STORAGE',
        data: newState
      });
    };
  }
} else {
  chrome.storage.local.get(Constants.STATE_KEY, (data: StorageState) => {
    store.dispatch({
      type: 'LOAD_STORAGE',
      data: data[Constants.STATE_KEY]
    });
  });

  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes[Constants.STATE_KEY].newValue) {
      store.dispatch({
        type: 'LOAD_STORAGE',
        data: changes[Constants.STATE_KEY].newValue
      });
    }
  });
}

export default store;
export const initialState = defaultStateObject[Constants.STATE_KEY];
