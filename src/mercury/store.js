/* @flow */

import { createStore } from 'redux';

import reducer from 'mercury/reducer';
import Constants, { createDirectory } from 'constants.js';

import type { StoreState, Action, StorageState } from 'types';

// Not actual valid state since real state will be taken from storage
const initialState: StorageState = {
  [Constants.STATE_KEY]: {
    loaded: false,
    workspaces: [],
    wfs: createDirectory('~', []),
    wsh: {
      env: {}
    },
    selectedWindow: 0,
    selectedWorkspace: 0
  }
};

const store = createStore(reducer, initialState);

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
