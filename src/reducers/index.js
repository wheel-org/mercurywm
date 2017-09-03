// import { combineReducers } from 'redux';

// import { combineReducers } from 'redux'
// import * as reducers from './reducers'
//
// const todoApp = combineReducers(reducers)

import ExecuteCommand from '../commands';
import { save } from '../storage';
import { findWindow } from '../utils';
import Constants from '../constants';
import { getBorderingLeft, getBorderingRight,
         getBorderingTop, getBorderingBottom } from '../utils';

const rootReducer = function (state = {}, action) {
    if (action.type !== 'UPDATE_COMMAND') console.log(action);
    let newState = JSON.parse(JSON.stringify(state));

    const index = findWindow(state, state.selectedWindow);
    let newTerminal = newState.workspaces[newState.selectedWorkspace].windows[index].terminal;

    switch(action.type) {
        case 'SELECT_WINDOW': {
            return {
                ...state,
                selectedWindow: action.id
            };
        }
        case 'SELECT_WORKSPACE': {
            return {
                ...state,
                selectedWorkspace: action.id,
                selectedWindow: state.workspaces[action.id].windows[0].id
            };
        }
        case 'INTENT_SELECT_WORKSPACE': {
            let currentWorkspace = state.selectedWorkspace;
            if (action.direction === Constants.KEY_LEFT_ARROW &&
                    currentWorkspace > 0) {
                currentWorkspace--;
            }
            else if (action.direction === Constants.KEY_RIGHT_ARROW &&
                    currentWorkspace < state.workspaces.length - 1) {
               currentWorkspace++;
            }
            return {
                ...state,
                selectedWorkspace: currentWorkspace,
                selectedWindow: state.workspaces[currentWorkspace].windows[0].id
            };
        }
        case 'INTENT_SELECT_WINDOW': {
            let result;
            let currentWindows = state.workspaces[state.selectedWorkspace].windows;
            switch(action.direction) {
                case Constants.KEY_LEFT_ARROW: result = getBorderingLeft(index, currentWindows, false); break;
                case Constants.KEY_RIGHT_ARROW: result = getBorderingRight(index, currentWindows, false); break;
                case Constants.KEY_UP_ARROW: result = getBorderingTop(index, currentWindows, false); break;
                case Constants.KEY_DOWN_ARROW: result = getBorderingBottom(index, currentWindows, false); break;
            }
            if (result) {
                return {
                    ...state,
                    selectedWindow: currentWindows[result[0]].id
                };
            }
            else {
                return state;
            }
        }
        case 'UPDATE_COMMAND': {
            // Split into smaller reducers later
            newTerminal.history[action.index] = action.text;
            return newState;
        }
        case 'ADD_COMMAND': {
            newTerminal.output.push({
                text: action.text,
                prompt: action.showPrompt ?
                    state.wsh.env.prompt.replace('%w', newTerminal.workingDirectory)
                                        .replace('%u', state.wsh.env.username) :
                    ''
            });
            return newState;
        }
        case 'EXECUTE_COMMAND': {
            newTerminal.history[newTerminal.history.length - 1] = action.text;
            newTerminal.history.push('');

            newTerminal.output.push({
                text: action.text,
                prompt: state.wsh.env.prompt.replace('%w', newTerminal.workingDirectory)
                                            .replace('%u', state.wsh.env.username)
            });

            return ExecuteCommand(newState, action.text);
        }
        case 'KILL_SCRIPT': {
            const scriptIndex = findWindow(newState, parseInt(action.id));
            newState.workspaces[newState.selectedWorkspace].windows[scriptIndex].terminal.inProg = false;
            newState.selectedWindow = action.id;
            return newState;
        }
        case 'SET_ENV': {
            state.wsh.env[action.key] = action.value;
            return state;
        }
        // case 'STORAGE_CHANGED': {
        //     return action.data;
        // }
        default:
            return state;
    }
}

const saveWrapper = function (state, action) {
    const newState = rootReducer(state, action);
    save(newState);
    return newState;
}

export default saveWrapper;
