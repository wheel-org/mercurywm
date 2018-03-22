/* @flow */

import store from 'background/store';
import { getFile, getDirectory, findWindow, getPath } from 'utils';

// Parse input into command and parameters
function parseInput(text): Array<string> {
  const tokens = text.trim().match(/[^\s"']+|"([^"]*)"|'([^']*)'/g);
  if (tokens)
    return tokens.map(t => t.replace(/^"|"$/g, '').replace(/^'|'$/g, ''));
  return [];
}

function Script(command) {
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
      store.dispatch({ type: 'EXECUTE_COMMAND', text: input });
    },
    resetStore: () => store.dispatch({ type: 'RESET_STORE' }),
    clearHistory: () => store.dispatch({ type: 'CLEAR_HISTORY' }),
    addCommand: (text: string, showPrompt: boolean) =>
      store.dispatch({ type: 'ADD_COMMAND', text, showPrompt }),
    executeCommand: (text: string) =>
      store.dispatch({ type: 'EXECUTE_COMMAND', text }),
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
      store.dispatch({ type: 'DELETE_WORKSPACE', id })
  };
}

export default function executeScript(id: number, input: string) {
  // if (commands[id] && commands[id].running) return;

  const [command, ...params] = parseInput(input);
  const script = new Script(command);

  const binFile = getFile('~/.bin/' + command);
  if (binFile) {
    // $FlowFixMe: flow doesn't like function objects
    new Function('script', 'params', binFile.data)(script, params);
  } else if (command === 'async') {
    asyncFn(script, params);
  } else {
    script.output('Unrecognized command');
  }
}

async function asyncFn(script, params) {
  setTimeout(() => {
    script.output('boo');
  }, 1000);
}

// case 'edit':
//   return script.execute(edit);
// case 'yum':
//   return script.execute(yum);
// case 'kill':
//   return script.execute(kill);

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
