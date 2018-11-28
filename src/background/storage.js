/* @flow strict */

import u from 'updeep';
import setupFile from 'background/setup';
import { createDirectory, createFile, createWorkspace } from 'creators';

import type { StorageState, StoreState } from 'types';

// INITIAL STATE
const id = Date.now();
export const initialState = {
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
      title: '',
      prompt: '%w $ ',
      username: Constants.NAME
    },
    aliases: {}
  },
  selectedWindow: id,
  selectedWorkspace: 0,
  version: Constants.VERSION
};
const defaultStateObject: StorageState = {
  [Constants.STATE_KEY]: initialState
};

export function load(callback: StoreState => void) {
  if (process.env.MERCURY_TARGET === 'web') {
    // No storage for web
    callback(defaultStateObject[Constants.STATE_KEY]);
  } else {
    chrome.storage.local.get(defaultStateObject, (data: StorageState) => {
      callback(data[Constants.STATE_KEY]);
    });
  }
}

export function clear() {
  // Need to deep copy default state
  const newState = u({ loaded: true }, initialState);
  if (process.env.MERCURY_TARGET !== 'web') {
    chrome.storage.local.set({ [Constants.STATE_KEY]: newState });
  }
  return newState;
}

export function save(state: StoreState) {
  if (state.loaded) {
    if (process.env.MERCURY_TARGET === 'web') {
      self.postMessage(state);
    } else {
      chrome.storage.local.set({ [Constants.STATE_KEY]: state });
    }
  }
}
