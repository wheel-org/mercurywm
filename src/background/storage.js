/* @flow */

import Constants, {
  createFile,
  createDirectory,
  createWorkspace
} from 'constants.js';
import setupFile from 'background/setup';

import type { StoreState, StorageState, Workspace, Directory } from 'types';

// INITIAL STATE
const id = Date.now();
const defaultStateObject: StorageState = {
  [Constants.STATE_KEY]: {
    loaded: false,
    workspaces: [createWorkspace(id)],
    wfs: createDirectory('~', [
      createFile(
        'Welcome',
        'Welcome to MercuryWM! Type `setup` to get started!\n'
      ),
      createDirectory('.bin', [createFile('setup', setupFile)])
    ]),
    wsh: {
      // environmental variables
      env: {
        background: '#555',
        title: Constants.NAME + ' ' + Constants.VERSION,
        prompt: '%w $ ',
        username: Constants.NAME
      }
    },
    selectedWindow: id,
    selectedWorkspace: 0
  }
};

function load(callback: StoreState => void) {
  chrome.storage.local.get(defaultStateObject, (data: StorageState) => {
    callback(data[Constants.STATE_KEY]);
  });
}

function clear() {
  const newState = {
    ...defaultStateObject[Constants.STATE_KEY],
    loaded: true
  };
  chrome.storage.local.set({ [Constants.STATE_KEY]: newState });
  return newState;
}

function save(state: StoreState) {
  if (state.loaded) {
    chrome.storage.local.set({ [Constants.STATE_KEY]: state });
  }
}

module.exports = {
  clear,
  load,
  save,
  initialState: defaultStateObject[Constants.STATE_KEY]
};