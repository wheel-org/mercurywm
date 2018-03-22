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
  | {| +type: 'TEST' |}
  | {| +type: 'LOAD_STORAGE', +data: StoreState |}
  | {| +type: 'RESET_STORE' |}
  | {| +type: 'SELECT_WORKSPACE', +id: number |}
  | {| +type: 'SELECT_WINDOW', +id: number |}
  | {| +type: 'INTENT_SELECT_WORKSPACE', +direction: number |}
  | {| +type: 'INTENT_SELECT_WINDOW', +direction: number |}
  | {| +type: 'KILL_SCRIPT', +id: number |}
  | {| +type: 'SET_ENV', +key: string, +value: string |}
  | {| +type: 'CREATE_OR_MODIFY_FILE', +path: string, +content: string |}
  | {| +type: 'SELECT_WORKSPACE', +id: number |}
  | {| +type: 'SELECT_WINDOW', +id: number |}
  | {| +type: 'UPDATE_COMMAND', +text: string, +index: number |}
  | {| +type: 'ADD_COMMAND', +text: string, +showPrompt: boolean |}
  | {| +type: 'EXECUTE_COMMAND', +text: string |};

// Storage
export type StorageState = { +[string]: StoreState };
