/* @flow */

// Components
export type Terminal = {|
  +history: Array<string>,
  +running: boolean,
  +output: Array<{
    +prompt: string,
    +text: string
  }>,
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
export type Store = {
  getState(): StoreState,
  +dispatch: Dispatch
};

// TODO: Flow has a bug where exact types become inexact after using the
// object spread operator. This affects the reducers where the state is spread
// out, so StoreState is inexact.
export type StoreState = {
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
};

export type Dispatch = (action: Action) => void;

export type Action =
  | {| +type: 'LOAD_STORAGE', +data: StoreState |}
  | {| +type: 'RESET_STORE' |}
  | {| +type: 'CLEAR_HISTORY' |}
  | {| +type: 'SELECT_WORKSPACE', +id: number |}
  | {| +type: 'ADD_WORKSPACE' |}
  | {| +type: 'DELETE_WORKSPACE', +id: number |}
  | {| +type: 'SELECT_WINDOW', +id: number |}
  // | {| +type: 'INTENT_SELECT_WORKSPACE', +direction: number |}
  // | {| +type: 'INTENT_SELECT_WINDOW', +direction: number |}
  | {| +type: 'KILL_SCRIPT', +id: number |}
  | {| +type: 'SET_ENV', +key: string, +value: string |}
  | {| +type: 'CREATE_OR_MODIFY_FILE', +path: string, +content: string |}
  | {| +type: 'CREATE_DIR', +path: string |}
  | {| +type: 'SELECT_WORKSPACE', +id: number |}
  | {| +type: 'SELECT_WINDOW', +id: number |}
  | {| +type: 'UPDATE_COMMAND', +text: string, +index: number |}
  | {| +type: 'ADD_COMMAND', +text: string, +showPrompt: boolean |}
  | {| +type: 'EXECUTE_COMMAND', +text: string |}
  | {|
      +type: 'SET_DIRECTORY',
      +path: string,
      +workspace: number,
      +window: number
    |}
  | {| +type: 'DELETE_FILE', +path: string |}
  | {| +type: 'DELETE_DIR', +path: string |};

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
  +exec: (input: string) => void,
  // Action creators
  +resetStore: () => void,
  +clearHistory: () => void,
  +addCommand: (text: string, showPrompt: boolean) => void,
  +executeCommand: (text: string) => void,
  +setEnv: (key: string, value: string) => void,
  +setDirectory: (path: string) => void,
  +createDirectory: (path: string) => void,
  +deleteFile: (path: string) => void,
  +deleteDirectory: (path: string) => void,
  +selectWorkspace: (id: number) => void,
  +addWorkspace: () => void,
  +deleteWorkspace: (id: number) => void
|};

export type Command = (script: Script, params: Array<string>) => void;
