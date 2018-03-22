/* @flow */

import u from 'updeep';
import {
  getFile,
  getDirectory,
  findWindow,
  getBorderingLeft,
  getBorderingRight,
  getBorderingTop,
  getBorderingBottom
} from 'utils';
import { executeCommand } from 'background/commands';
import { save, clear } from 'background/storage';
import Constants, {
  createFile,
  createDirectory,
  createWorkspace
} from 'constants.js';

import type { StoreState, Action, Terminal, Directory } from 'types';

function pushArrayElement<T>(element: T): (Array<T>) => Array<T> {
  return (array: Array<T>) => [...array, element];
}

function removeArrayElement<T>(index: number): (Array<T>) => Array<T> {
  return (array: Array<T>) => [
    ...array.slice(0, index),
    ...array.slice(index + 1)
  ];
}

function editFilesystem(
  directory: Directory,
  parts: Array<string>,
  callback: (Directory, string) => Directory
): Directory {
  // TODO: is this a hack?
  if (parts.length > 0 && parts[0] === '~') {
    // Remove root directory
    parts.shift();
  }

  if (parts.length === 1) {
    return callback(directory, parts[0]);
  }

  // Look for subdirectory
  const dirName = parts[0];
  const subDirIndex = directory.data.findIndex(
    item => item.type === Constants.DIR_TYPE && item.name === dirName
  );
  if (subDirIndex >= 0) {
    // Subdirectory found
    const subDir: Directory = (directory.data[subDirIndex]: any);
    return u(
      {
        data: {
          [subDirIndex]: editFilesystem(subDir, parts.slice(1), callback)
        }
      },
      directory
    );
  } else {
    // No subdirectory found
    // TODO: does this need to be copied?
    return directory;
  }
}

function updateCurrTerminal(
  state: StoreState,
  index: number,
  newTerminal: Terminal
): StoreState {
  return u(
    {
      workspaces: {
        [state.selectedWorkspace]: {
          windows: {
            [index]: {
              terminal: newTerminal
            }
          }
        }
      }
    },
    state
  );
}

const rootReducer = function(state: StoreState, action: Action): StoreState {
  console.log(action);

  const index = findWindow(state, state.selectedWindow);
  const currTerminal =
    state.workspaces[state.selectedWorkspace].windows[index].terminal;

  switch (action.type) {
    case 'LOAD_STORAGE':
      return {
        ...action.data,
        loaded: true
      };

    case 'RESET_STORE':
      return clear();

    case 'CLEAR_HISTORY':
      return updateCurrTerminal(state, index, u({ output: [] }, currTerminal));

    case 'SELECT_WORKSPACE':
      return {
        ...state,
        selectedWorkspace: action.id,
        selectedWindow: state.workspaces[action.id].windows[0].id
      };

    case 'ADD_WORKSPACE':
      return u(
        {
          workspaces: pushArrayElement(createWorkspace(Date.now()))
        },
        state
      );

    case 'DELETE_WORKSPACE':
      return u(
        {
          workspaces: removeArrayElement(action.id)
        },
        state
      );

    case 'SELECT_WINDOW':
      return {
        ...state,
        selectedWindow: action.id
      };

    case 'UPDATE_COMMAND':
      return updateCurrTerminal(
        state,
        index,
        u(
          {
            history: { [action.index]: action.text }
          },
          currTerminal
        )
      );

    case 'ADD_COMMAND':
      return updateCurrTerminal(
        state,
        index,
        u(
          {
            output: pushArrayElement({
              text: action.text,
              prompt: action.showPrompt
                ? state.wsh.env.prompt
                    .replace('%w', currTerminal.workingDirectory)
                    .replace('%u', state.wsh.env.username)
                : ''
            })
          },
          currTerminal
        )
      );

    case 'EXECUTE_COMMAND':
      const text = action.text;
      const newState = updateCurrTerminal(
        state,
        index,
        u(
          {
            history: draftHistory => [...draftHistory.slice(0, -1), text, ''],
            output: pushArrayElement({
              text,
              prompt: state.wsh.env.prompt
                .replace('%w', currTerminal.workingDirectory)
                .replace('%u', state.wsh.env.username)
            })
          },
          currTerminal
        )
      );

      // TODO: fix mutation hack
      // Commands should be free to mutate newState since it is a clone of state
      // However, updeep freezes objects in development, so newState can't be
      // mutated. This hack temporarily deep copies newState to allow mutation.
      return executeCommand(JSON.parse(JSON.stringify(newState)), text);

    case 'KILL_SCRIPT':
      const scriptIndex = findWindow(state, action.id);
      return {
        ...updateCurrTerminal(
          state,
          index,
          u(
            {
              running: false
            },
            currTerminal
          )
        ),
        selectedWindow: action.id
      };

    case 'CREATE_OR_MODIFY_FILE':
      const contents = action.content;
      return {
        ...state,
        wfs: editFilesystem(
          state.wfs,
          action.path.split('/'),
          (parentDir, fileName) => {
            // Look for file
            const fileIndex = parentDir.data.findIndex(
              item => item.type == Constants.FILE_TYPE && item.name === fileName
            );
            if (fileIndex >= 0) {
              // File found: modify
              return u(
                {
                  data: {
                    [fileIndex]: {
                      data: contents
                    }
                  }
                },
                parentDir
              );
            } else {
              // File not found: create
              return u({
                data: dirData => [...dirData, createFile(fileName, contents)]
              });
            }
          }
        )
      };

    case 'SET_ENV':
      return u({ wsh: { env: { [action.key]: action.value } } }, state);

    case 'SET_DIRECTORY':
      return u(
        {
          workspaces: {
            [action.workspace]: {
              windows: {
                [action.window]: {
                  terminal: {
                    workingDirectory: action.path
                  }
                }
              }
            }
          }
        },
        state
      );

    case 'CREATE_DIR':
      return {
        ...state,
        wfs: editFilesystem(
          state.wfs,
          action.path.split('/'),
          (parentDir, dirName) => {
            // Check for dir
            const dirIndex = parentDir.data.findIndex(
              item => item.type == Constants.DIR_TYPE && item.name === dirName
            );
            if (dirIndex >= 0) {
              return parentDir;
            } else {
              return u(
                {
                  data: pushArrayElement(createDirectory(dirName))
                },
                parentDir
              );
            }
          }
        )
      };

    case 'DELETE_FILE':
      return {
        ...state,
        wfs: editFilesystem(
          state.wfs,
          action.path.split('/'),
          (parentDir, fileName) => {
            // Look for file
            const fileIndex = parentDir.data.findIndex(
              item => item.type == Constants.FILE_TYPE && item.name === fileName
            );
            if (fileIndex >= 0) {
              return u(
                {
                  data: removeArrayElement(fileIndex)
                },
                parentDir
              );
            } else {
              return parentDir;
            }
          }
        )
      };

    case 'DELETE_DIR':
      return {
        ...state,
        wfs: editFilesystem(
          state.wfs,
          action.path.split('/'),
          (parentDir, dirName) => {
            // Look for file
            const dirIndex = parentDir.data.findIndex(
              item => item.type == Constants.DIR_TYPE && item.name === dirName
            );
            if (dirIndex >= 0) {
              return u(
                {
                  data: removeArrayElement(dirIndex)
                },
                parentDir
              );
            } else {
              return parentDir;
            }
          }
        )
      };

    default:
      action;
      return state;
  }
};

const saveWrapper = function(state: StoreState, action: Action) {
  const newState = rootReducer(state, action);
  save(newState);
  return newState;
};

export default saveWrapper;

// // TODO: this is too specific for a reducer
// // move the logic out to the function using it and
// // just call SELECT_WORKSPACE
// case 'INTENT_SELECT_WORKSPACE':
//   let currentWorkspace = state.selectedWorkspace;
//   if (action.direction === Constants.KEY_LEFT_ARROW) {
//     currentWorkspace--;
//     if (currentWorkspace < 0) {
//       currentWorkspace = state.workspaces.length - 1;
//     }
//   } else if (action.direction === Constants.KEY_RIGHT_ARROW) {
//     currentWorkspace++;
//     if (currentWorkspace >= state.workspaces.length) {
//       currentWorkspace = 0;
//     }
//   }
//   return {
//     ...state,
//     selectedWorkspace: currentWorkspace,
//     selectedWindow: state.workspaces[currentWorkspace].windows[0].id
//   };
//
// // TODO: same issue as INTENT_SELECT_WORKSPACE
// case 'INTENT_SELECT_WINDOW': {
//   const currentWindows = state.workspaces[state.selectedWorkspace].windows;
//   let result;
//   switch (action.direction) {
//     case Constants.KEY_LEFT_ARROW:
//       result = getBorderingLeft(index, currentWindows, false);
//       break;
//     case Constants.KEY_RIGHT_ARROW:
//       result = getBorderingRight(index, currentWindows, false);
//       break;
//     case Constants.KEY_UP_ARROW:
//       result = getBorderingTop(index, currentWindows, false);
//       break;
//     case Constants.KEY_DOWN_ARROW:
//       result = getBorderingBottom(index, currentWindows, false);
//       break;
//   }
//   if (result && result.length > 0) {
//     return {
//       ...state,
//       selectedWindow: currentWindows[result[0]].id
//     };
//   } else {
//     return {
//       ...state
//     };
//   }
// }
