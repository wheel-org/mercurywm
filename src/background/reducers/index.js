/* @flow */

import u from 'updeep';
import {
  getFile,
  getDirectory,
  findWindow,
  createOrModifyFile,
  getBorderingLeft,
  getBorderingRight,
  getBorderingTop,
  getBorderingBottom
} from 'utils';
import { save, clear } from 'background/storage';
import Constants, { createFile } from 'constants';

import type { StoreState, Action, Terminal, Directory } from 'types';

function pushArrayElement<T>(element: T): (Array<T>) => Array<T> {
  return (array: Array<T>) => [...array, element];
}

function updateCurrTerminal(
  state: StoreState,
  newTerminal: Terminal
): StoreState {
  const index = findWindow(state, state.selectedWindow);
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

    case 'SELECT_WORKSPACE':
      return {
        ...state,
        selectedWorkspace: action.id,
        selectedWindow: state.workspaces[action.id].windows[0].id
      };

    case 'SELECT_WINDOW':
      return {
        ...state,
        selectedWindow: action.id
      };

    case 'INTENT_SELECT_WORKSPACE':
      let currentWorkspace = state.selectedWorkspace;
      if (action.direction === Constants.KEY_LEFT_ARROW) {
        currentWorkspace--;
        if (currentWorkspace < 0) {
          currentWorkspace = state.workspaces.length - 1;
        }
      } else if (action.direction === Constants.KEY_RIGHT_ARROW) {
        currentWorkspace++;
        if (currentWorkspace >= state.workspaces.length) {
          currentWorkspace = 0;
        }
      }
      return {
        ...state,
        selectedWorkspace: currentWorkspace,
        selectedWindow: state.workspaces[currentWorkspace].windows[0].id
      };

    case 'INTENT_SELECT_WINDOW': {
      const currentWindows = state.workspaces[state.selectedWorkspace].windows;
      let result;
      switch (action.direction) {
        case Constants.KEY_LEFT_ARROW:
          result = getBorderingLeft(index, currentWindows, false);
          break;
        case Constants.KEY_RIGHT_ARROW:
          result = getBorderingRight(index, currentWindows, false);
          break;
        case Constants.KEY_UP_ARROW:
          result = getBorderingTop(index, currentWindows, false);
          break;
        case Constants.KEY_DOWN_ARROW:
          result = getBorderingBottom(index, currentWindows, false);
          break;
      }
      if (result && result.length > 0) {
        return {
          ...state,
          selectedWindow: currentWindows[result[0]].id
        };
      } else {
        return {
          ...state
        };
      }
    }

    case 'UPDATE_COMMAND':
      return updateCurrTerminal(
        state,
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
      return updateCurrTerminal(
        state,
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

    case 'KILL_SCRIPT':
      const scriptIndex = findWindow(state, action.id);

      return u(
        {
          workspaces: {
            [state.selectedWorkspace]: {
              windows: {
                [scriptIndex]: {
                  terminal: { running: false, selectedWindow: action.id }
                }
              }
            }
          }
        },
        state
      );

    case 'CREATE_OR_MODIFY_FILE':
      return {
        ...state,
        wfs: createOrModifyFile(
          action.path.split('/'),
          action.content,
          state.wfs
        )
      };

    case 'SET_ENV':
      return u({ wsh: { env: { [action.key]: action.value } } }, state);

    case 'TEST':
      return u(
        {
          wsh: {
            env: { test: state.wsh.env.test ? state.wsh.env.test + 1 : '1' }
          }
        },
        state
      );

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
