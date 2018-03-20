/* @flow */

import u from 'updeep';

import { findWindow } from './utils';
import executeCommand from './background';

import type { StoreState, Action, Terminal } from 'types';

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

const reducer = (state: StoreState, action: Action) => {
  console.log(action);
  if (action.type === 'LOAD_STORAGE') {
    return { ...action.data };
  }
  if (!state.loaded) {
    return state;
  }

  const index = findWindow(state, state.selectedWindow);
  const currTerminal =
    state.workspaces[state.selectedWorkspace].windows[index].terminal;

  switch (action.type) {
    case 'RESET_STORE':
      executeCommand(state, 'reset');
      return state;
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
    default:
      // Send action to background
      return state;
  }
};

// | {| +type: 'SELECT_WORKSPACE', +id: number |}
// | {| +type: 'SELECT_WINDOW', +id: number |}
// | {| +type: 'LOAD_STORAGE', +data: StoreState |}
// | {| +type: 'INTENT_SELECT_WORKSPACE', +direction: number |}
// | {| +type: 'INTENT_SELECT_WINDOW', +direction: number |}
// | {| +type: 'KILL_SCRIPT', +id: number |}
// | {| +type: 'SET_ENV', +key: string, +value: string |}
// | {| +type: 'CREATE_OR_MODIFY_FILE', +path: string, +content: string |}
// | {| +type: 'SELECT_WORKSPACE', +id: number |}
// | {| +type: 'SELECT_WINDOW', +id: number |}
// | {| +type: 'UPDATE_COMMAND', +text: string, +index: number |}
// | {| +type: 'ADD_COMMAND', +text: string, +showPrompt: boolean |}
// | {| +type: 'ENTER_COMMAND', +text: string |}
// | {| +type: 'EXECUTE_COMMAND', +text: string |};

export default reducer;
