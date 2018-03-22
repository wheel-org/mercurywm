/* @flow */

import { createStore } from 'redux';
import Storage from 'background/storage';
import reducers from 'background/reducers';

import type { Store, Action } from 'types';

const store: Store = createStore(reducers, Storage.initialState);

Storage.load(newState => {
  store.dispatch({
    type: 'LOAD_STORAGE',
    data: newState
  });
});

export default store;
