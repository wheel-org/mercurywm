/* @flow */

import store from 'background/store';

import type { Directory, File, StoreState, Window } from 'types';

function getStack(path: string): Array<File | Directory> {
  const stack = [store.getState().wfs];
  const splitPath = path.split('/');

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
        if (!next) return []; // Child doesn't exists
        stack.push(next);
      } else {
        // Not a directory
        return [];
      }
    }
  }

  return stack;
}

export function getFile(filePath: string, currentPath: string = '~'): ?File {
  const top = getStack(currentPath + '/' + filePath).pop();
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
  const top = getStack(currentPath + '/' + filePath).pop();
  if (top && top.type === 'dir') {
    // Needs to be a directory
    return top;
  }

  return null;
}

export function getPath(path: string, currentPath: string = '~'): string {
  const stack = getStack(path);
  return stack.map(item => item.name).join('/');
}

export function findWindow(state: StoreState, id: number) {
  if (state.selectedWorkspace >= state.workspaces.length) {
    return -1;
  }

  const windows = state.workspaces[state.selectedWorkspace].windows;
  const index = windows.findIndex(w => w.id === id);
  return index;
}

// the following commands either returns a list of windows that are exact
//   borders of the given index, or false if there are none
function borderingComp(
  index,
  windows,
  borderingComp: (Window, Window) => boolean, // Next to window
  containsComp: (Window, Window) => boolean, // Contains bordering window
  containedComp: (Window, Window) => boolean, // Contained by bordering window
  isStrict
): Array<number> {
  const borderingWindows = [];
  const a = windows[index];
  for (let i = 0; i < windows.length; i++) {
    if (i !== index) {
      const b = windows[i];
      if (borderingComp(a, b)) {
        // Bordering
        if (containsComp(a, b) || !isStrict) {
          borderingWindows.push(i);
        } else if (!containedComp(a, b)) {
          // TODO: check logic of this else if statement
          return [];
        }
      }
    }
  }
  return borderingWindows;
}

export function getBorderingLeft(
  index: number,
  windows: Array<Window>,
  isStrict: boolean = true
) {
  return borderingComp(
    index,
    windows,
    (a, b) => b.x + b.width === a.x,
    (a, b) => b.y >= a.y && b.y + b.height <= a.y + a.height,
    (a, b) => b.y >= a.y + a.height || b.y + b.height <= a.y,
    isStrict
  );
}

export function getBorderingRight(
  index: number,
  windows: Array<Window>,
  isStrict: boolean = true
) {
  return borderingComp(
    index,
    windows,
    (a, b) => b.x === a.x + a.width,
    (a, b) => b.y >= a.y && b.y + b.height <= a.y + a.height,
    (a, b) => b.y >= a.y + a.height || b.y + b.height <= a.y,
    isStrict
  );
}

export function getBorderingTop(
  index: number,
  windows: Array<Window>,
  isStrict: boolean = true
) {
  return borderingComp(
    index,
    windows,
    (a, b) => b.y + b.height === a.y,
    (a, b) => b.x >= a.x && b.x + b.width <= a.x + a.width,
    (a, b) => b.x >= a.x + a.width || b.x + b.width <= a.x,
    isStrict
  );
}

export function getBorderingBottom(
  index: number,
  windows: Array<Window>,
  isStrict: boolean = true
) {
  return borderingComp(
    index,
    windows,
    (a, b) => b.y === a.y + a.height,
    (a, b) => b.x >= a.x && b.x + b.width <= a.x + a.width,
    (a, b) => b.x >= a.x + a.width || b.x + b.width <= a.x,
    isStrict
  );
}
