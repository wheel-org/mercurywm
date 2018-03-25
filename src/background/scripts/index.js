/* @flow */

import store from 'background/store';
import { getFile, getDirectory, findWindow, getPath } from 'utils';

import type { Script as ScriptType } from 'types';

// Parse input into command and parameters
function parseInput(text): Array<string> {
  const tokens = text.trim().match(/[^\s"']+|"([^"]*)"|'([^']*)'/g);
  if (tokens)
    return tokens.map(t => t.replace(/^"|"$/g, '').replace(/^'|'$/g, ''));
  return [];
}

function Script(command): ScriptType {
  const workspaceID = store.getState().selectedWorkspace;
  const windowID = findWindow(
    store.getState(),
    store.getState().selectedWindow
  );
  const currentWindow = store.getState().workspaces[workspaceID].windows[
    windowID
  ];
  return {
    getState: store.getState,
    workspaceID,
    windowID,
    currentWindow,
    currentPath: currentWindow.terminal.workingDirectory,
    getFile,
    getDirectory,
    getPath,
    output: function(text, showPrompt = false, showCommand = true) {
      store.dispatch({
        type: 'ADD_COMMAND',
        text: showCommand ? command + ': ' + text : text,
        showPrompt
      });
    },
    exec: function(input: string) {
      store.dispatch({ type: 'EXECUTE_COMMAND', text: input, hidden: true });
    },
    resetStore: () => store.dispatch({ type: 'RESET_STORE' }),
    clearHistory: () => store.dispatch({ type: 'CLEAR_HISTORY' }),
    addCommand: (text: string, showPrompt: boolean) =>
      store.dispatch({ type: 'ADD_COMMAND', text, showPrompt }),
    setEnv: (key: string, value: string) =>
      store.dispatch({ type: 'SET_ENV', key, value }),
    setDirectory: (path: string) =>
      store.dispatch({
        type: 'SET_DIRECTORY',
        path,
        workspace: workspaceID,
        window: windowID
      }),
    createDirectory: (path: string) =>
      store.dispatch({ type: 'CREATE_DIR', path }),
    deleteFile: (path: string) => store.dispatch({ type: 'DELETE_FILE', path }),
    deleteDirectory: (path: string) =>
      store.dispatch({ type: 'DELETE_DIR', path }),
    selectWorkspace: (id: number) =>
      store.dispatch({ type: 'SELECT_WORKSPACE', id }),
    addWorkspace: () => store.dispatch({ type: 'ADD_WORKSPACE' }),
    deleteWorkspace: (id: number) =>
      store.dispatch({ type: 'DELETE_WORKSPACE', id }),
    getFile: (path: string) => {
      const file = getFile(path);
      if (file) return file;
      // Backward compatibility
      return false;
    },
    writeFile: (path: string, content: string) =>
      store.dispatch({ type: 'CREATE_OR_MODIFY_FILE', path, content })
  };
}

export default function executeScript(id: number, input: string) {
  // if (commands[id] && commands[id].running) return;

  const [command, ...params] = parseInput(input);
  const script = new Script(command);

  const binFile = getFile('~/.bin/' + command);
  if (binFile) {
    // $FlowFixMe: flow doesn't like function objects
    new Function('script', 'args', binFile.data)(script, params);
    script.exec('kill ' + script.windowID);
  } else if (command === 'async') {
    asyncFn(script, params);
  } else if (command === 'edit') {
    edit(script, params);
  } else if (command === 'yum') {
    yum(script, params);
  } else {
    script.output('Unrecognized command');
    script.exec('kill ' + script.windowID);
  }
}

async function asyncFn(script, params) {
  setTimeout(() => {
    script.output('boo');
    script.exec('kill ' + script.windowID);
  }, 1000);
}

async function edit(script, params) {
  if (params.length === 1) {
    const path = script.currentPath + '/' + params[0];
    const file = getFile(path);
    const text = file ? file.data : '';

    const result = window.prompt('Editing' + path + ':', text);
    if (result !== null) {
      script.writeFile(path, result);
    }
  } else {
    script.output('Incorrect number of parameters');
  }
  script.exec('kill ' + script.windowID);
}

async function yum(script, params) {
  if (params.length === 0) {
    script.output('spaghetti sauce');
    script.exec('kill ' + script.windowID);
  } else if (params.length === 2) {
    // Pull URL
    const path = script.currentPath + '/' + params[1];
    script.output('Downloading ' + params[0] + '...');
    const request = new XMLHttpRequest();
    request.open('GET', params[0]);
    request.onreadystatechange = function() {
      if (request.readyState == 4) {
        if (request.status == 200) {
          script.output('download success');
          script.output('data written to file ' + path);
          script.writeFile(path, request.responseText);
          script.exec('kill ' + script.windowID);
        } else {
          script.output('download failed: status ' + request.status);
          script.exec('kill ' + script.windowID);
        }
      }
    };
    request.send();
  } else {
    script.output('Incorrect number of parameters');
    script.exec('kill ' + script.windowID);
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

export function kill(id: number) {
  // if (commands[id]) {
  //   commands[id].kill();
  // }
}
