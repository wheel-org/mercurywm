/* @flow */

import store from 'mercury/store';
import Constants, {createFile} from 'constants.js';

import type { File, Directory, Window, StoreState } from 'types';

function getFileOrDirectory(
  filePath: string,
  currentPath: string
): ?(File | Directory) {
  const { loaded, wfs } = store.getState();

  if (!loaded) return null;

  const stack = [wfs];
  const splitPath = currentPath.split('/').concat(filePath.split('/'));

  // Get to current directory
  for (let i = 0; i < splitPath.length; i++) {
    const name = splitPath[i];
    if (name === '~') {
      // Back to root
      stack.splice(1);
    } else if (name === '..') {
      // Go up to parent
      if (stack.length > 1) {
        stack.pop();
      }
    } else if (name !== '.') {
      // '.' is same directory
      const top = stack.slice(-1)[0];
      // Find if name exists within the current directory
      if (top.type === 'dir') {
        const next = top.data.find(child => child.name === name);
        if (!next) return null; // Child doesn't exists
        stack.push(next);
      } else {
        // Not a directory
        return null;
      }
    }
  }

  return stack.pop();
}

export function getFile(filePath: string, currentPath: string = '~'): ?File {
  const top = getFileOrDirectory(filePath, currentPath);
  if (top && top.type === 'file') {
    // Needs to be a file
    return top;
  }

  return null;
}

export function getDirectory(
  filePath: string,
  currentPath: string = '~'
): ?Directory {
  const top = getFileOrDirectory(filePath, currentPath);
  if (top && top.type === 'dir') {
    // Needs to be a file
    return top;
  }

  return null;
}

export function findWindow(state: StoreState, id: number) {
  if (state.selectedWorkspace >= state.workspaces.length) {
    return -1;
  }

  const windows = state.workspaces[state.selectedWorkspace].windows;
  const index = windows.findIndex(w => w.id === id);
  return index;
}
