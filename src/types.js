/* @flow strict */

import type { Store as ReduxStore } from 'redux';

// Components
export type Terminal = {|
  +history: Array<string>,
  +running: boolean,
  +isExtension: boolean,
  +output: Array<{|
    +prompt: string,
    +text: string
  |}>,
  +runningCommand: string,
  +params: Array<string>,
  +workingDirectory: string
|};

export type Window = {|
  +x: number,
  +y: number,
  +width: number,
  +height: number,
  +id: number,
  +terminal: Terminal
|};

export type Workspace = {|
  +windows: Array<Window>
|};

// File system
export type Directory = {|
  +type: 'dir',
  +name: string,
  +data: Array<File | Directory>
|};

export type File = {|
  +type: 'file',
  +name: string,
  +data: string
|};

// Redux
export type Store = ReduxStore<StoreState, Action, Dispatch>;

export type StoreState = {|
  +loaded: boolean,
  +workspaces: Array<Workspace>,
  +wfs: Directory,
  +wsh: {
    +env: {
      +[string]: string
    }
  },
  +selectedWindow: number,
  +selectedWorkspace: number
|};

export type Dispatch = (action: Action) => void;

export type Action =
  | {| +type: 'LOAD_STORAGE', +data: StoreState |}
  | {| +type: 'RESET_STORE' |}
  | {| +type: 'CLEAR_HISTORY' |}
  | {| +type: 'SELECT_WORKSPACE', +id: number |}
  | {| +type: 'ADD_WORKSPACE', +windows: Array<Window> |}
  | {| +type: 'DELETE_WORKSPACE', +id: number |}
  | {| +type: 'SELECT_WINDOW', +id: number |}
  | {| +type: 'KILL_SCRIPT', +id: number |}
  | {| +type: 'SET_ENV', +key: string, +value: string |}
  | {| +type: 'CREATE_OR_MODIFY_FILE', +path: string, +content: string |}
  | {| +type: 'CREATE_DIR', +path: string, +contents: Array<File | Directory> |}
  | {| +type: 'SELECT_WORKSPACE', +id: number |}
  | {| +type: 'SELECT_WINDOW', +id: number |}
  | {| +type: 'UPDATE_COMMAND', +text: string, +index: number |}
  | {| +type: 'ADD_COMMAND', +text: string, +showPrompt: boolean |}
  | {| +type: 'EXECUTE_COMMAND', +text: string, +hidden?: boolean |}
  | {|
      +type: 'SET_DIRECTORY',
      +path: string,
      +workspace: number,
      +window: number
    |}
  | {| +type: 'DELETE_FILE', +path: string |}
  | {| +type: 'DELETE_DIR', +path: string |}
  | {| +type: 'RUN_EXTENSION', +name: string, +params: Array<string> |}
  | {| +type: 'INTENT_SELECT_WORKSPACE', +direction: number |}
  | {| +type: 'INTENT_SELECT_WINDOW', +direction: number |};

// Storage
export type StorageState = { +[string]: StoreState };

// Evaluating commands
export type Script = {|
  +getState: () => StoreState,
  +workspaceID: number,
  +windowID: number,
  +currentWindow: Window,
  +currentPath: string,
  +getFile: (path: string, currentPath?: string) => ?File,
  +getDirectory: (path: string, currentPath?: string) => ?Directory,
  +getPath: (path: string, currentPath?: string) => string,
  +output: (text: string, showPrompt?: boolean, showCommand?: boolean) => void,
  +exec: (input: string, callback?: (any) => void) => void,
  // Action creators
  // +resetStore: () => void,
  // +clearHistory: () => void,
  // +addCommand: (text: string, showPrompt: boolean) => void,
  // +setEnv: (key: string, value: string) => void,
  // +setDirectory: (path: string) => void,
  +createFile: (name: string, data: string) => File,
  +createTerminal: () => Terminal,
  +createWindow: (
    x: number,
    y: number,
    w: number,
    h: number,
    id: number
  ) => Window,
  +createDirectory: (path: string, contents: Array<File | Directory>) => void,
  +deleteFile: (path: string) => void,
  +deleteDirectory: (path: string) => void,
  +selectWorkspace: (id: number) => void,
  +addWorkspace: (windows: Array<Window>) => void,
  +deleteWorkspace: (id: number) => void,
  +getFile: (path: string) => ?File | false,
  +writeFile: (path: string, content: string) => void,
  +runExtension: (name: string, params: Array<string>) => void
|};

export type Command = (script: Script, params: Array<string>) => void;

// Message send by extension to Mercury
export type ExtensionMessage =
  | {|
      +type: 'done',
      +id: string
    |}
  | {|
      +type: 'env',
      +key: string,
      +value: string
    |}
  | {|
      +type: 'requestFile',
      +path: string
    |}
  | {|
      +type: 'writeFile',
      +path: string,
      +content: string
    |};

// Response message from Mercury to extension
export type ExtensionResponse = {|
  +type: 'file',
  +path: string,
  +contents: string
|};
