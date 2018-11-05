/* @flow strict */

import { isCommand } from 'background/commands';
import store from 'background/store';
import { createFile, createTerminal, createWindow } from 'creators';
import { findWindow, getDirectory, getFile, getPath } from 'utils';

import type { Directory, File, Script as ScriptType, Window } from 'types';

// Parse input into command and parameters
function parseInput(text): Array<string> {
    const tokens = text.trim().match(/[^\s"']+|"([^"]*)"|'([^']*)'/g);
    if (tokens) return tokens.map(t => t.replace(/^"|"$/g, '').replace(/^'|'$/g, ''));
    return [];
}

// List of built-in scripts (doesn't include .bin)
function isScript(name: string) {
    const names = ['async', 'edit', 'yum'];
    return names.find(n => n === name);
}

function Script(command): ScriptType {
    const workspaceID = store.getState().selectedWorkspace;
    const selectedWindow = store.getState().selectedWindow;
    const windowID = findWindow(store.getState(), selectedWindow);
    const currentWindow = store.getState().workspaces[workspaceID].windows[windowID];
    return {
        getState: store.getState,
        workspaceID,
        windowID,
        currentWindow,
        currentPath: currentWindow.terminal.workingDirectory,
        getFile: function(filePath: string, currentPath: string = '~') {
            return getFile(filePath, store.getState().wfs, currentPath);
        },
        getDirectory: function(filePath: string, currentPath: string = '~') {
            return getDirectory(filePath, store.getState().wfs, currentPath);
        },
        getPath: function(path: string, currentPath: string = '~') {
            return getPath(path, store.getState().wfs, currentPath);
        },
        output: function(text, showPrompt = false, showCommand = true) {
            store.dispatch({
                type: 'ADD_COMMAND',
                text: showCommand ? command + ': ' + text : text,
                showPrompt
            });
        },
        exec: function(input: string, callback?: any => void) {
            const [cmd] = input.split(' ');
            if (cmd && !isCommand(cmd)) {
                executeScript(selectedWindow, input, callback);
            } else {
                store.dispatch({ type: 'EXECUTE_COMMAND', text: input, hidden: true });
                if (callback) callback();
            }
        },
        // resetStore: () => store.dispatch({ type: 'RESET_STORE' }),
        // clearHistory: () => store.dispatch({ type: 'CLEAR_HISTORY' }),
        // addCommand: (text: string, showPrompt: boolean) =>
        //   store.dispatch({ type: 'ADD_COMMAND', text, showPrompt }),
        // setEnv: (key: string, value: string) =>
        //   store.dispatch({ type: 'SET_ENV', key, value }),
        // setDirectory: (path: string) =>
        //   store.dispatch({
        //     type: 'SET_DIRECTORY',
        //     path,
        //     workspace: workspaceID,
        //     window: windowID
        //   }),
        createFile: (name: string, data: string) => createFile(name, data),
        createTerminal: () => createTerminal(),
        createWindow: (x: number, y: number, w: number, h: number, id: number) => createWindow(x, y, w, h, id),
        createDirectory: (path: string, contents: Array<File | Directory>) =>
            store.dispatch({ type: 'CREATE_DIR', path, contents }),
        deleteFile: (path: string) => store.dispatch({ type: 'DELETE_FILE', path }),
        deleteDirectory: (path: string) => store.dispatch({ type: 'DELETE_DIR', path }),
        selectWorkspace: (id: number) => store.dispatch({ type: 'SELECT_WORKSPACE', id }),
        addWorkspace: (windows: Array<Window>) => store.dispatch({ type: 'ADD_WORKSPACE', windows }),
        deleteWorkspace: (id: number) => store.dispatch({ type: 'DELETE_WORKSPACE', id }),
        getFile: (path: string) => {
            const file = getFile(path, store.getState().wfs);
            if (file) return file;
            // Backward compatibility
            return false;
        },
        writeFile: (path: string, content: string) => store.dispatch({ type: 'CREATE_OR_MODIFY_FILE', path, content }),
        runExtension: (name: string, params: Array<string>) => store.dispatch({ type: 'RUN_EXTENSION', name, params })
    };
}

function Async(func, script, params, resolve?) {
    function newResolve(...args: Array<any>) {
        if (resolve) resolve(...args);
        else script.exec('kill -s ' + script.windowID);
    }

    const val = func(script, params, newResolve);
    // If the script returns nothing, it's assumed that the script is synchronous
    // and it will not call resolve to finish.
    if (val === undefined) newResolve();
}

export default function executeScript(id: number, input: string, callback?: any => void) {
    // if (commands[id] && commands[id].running) return;
    const [name, ...params] = parseInput(input);
    const script = new Script(name);

    const binFile = getFile('~/.bin/' + name, store.getState().wfs);
    if (binFile) {
        // $FlowFixMe: Flow doesn't like function objects
        const binFunc = new Function('script', 'args', 'resolve', binFile.data);
        try {
            Async(binFunc, script, params, callback);
        } catch (e) {
            script.output('Error: ' + e);
            script.exec('kill -s ' + script.windowID);
        }
    } else if (isScript(name)) {
        Async(require('./' + name).default, script, params, callback);
    } else {
        const path = Constants.MERCURYWM_CONTENT_URL + name + '/index.html';
        fetch(path)
            .then(response => {
                if (response.ok) script.runExtension(name, params);
                else throw 'Unrecognized command';
            })
            .catch(error => {
                script.output(error);
                script.exec('kill -s ' + script.windowID);
            });
    }
}

/*
When a terminal runs a command, it sets itself to running = true, and doesn't allow any input.
In the reducer, the command sends a message to this background script, along with additional
information to identify the terminal such as the window ID.
*/
// const commands: { [number]: Command } = {};
// class Command {
//   params: Array<string>;
//   callback: any => void;
//   running: boolean;
//
//   constructor(params: Array<string>, callback: any => void) {
//     this.params = params;
//     this.callback = callback;
//     this.running = true;
//   }
//
//   run() {}
//
//   kill() {
//     this.running = false;
//   }
// }
//
// class Reset extends Command {
//   run() {
//     // Perform long calculations
//     setTimeout(() => {
//       if (this.running) {
//         this.callback('goodbye ' + this.params.toString());
//         this.running = false;
//       }
//     }, 1000);
//   }
// }
