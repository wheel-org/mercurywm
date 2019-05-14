/* @flow strict */

import { createDirectory } from 'creators';
import reducer from 'mercury/reducer';
import { createStore } from 'redux';

import type { StorageState, Store } from 'types';

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

export default store;
export const initialState = defaultStateObject[Constants.STATE_KEY];
