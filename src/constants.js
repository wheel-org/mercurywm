/* @flow */

import type {
  Terminal,
  Window,
  Workspace,
  Directory,
  File
} from 'types';

/* Constants */
const Constants = {
  NAME: 'Mercury WM',
  VERSION: '1.1',
  STATE_KEY: 'state',
  DIR_TYPE: 'dir',
  FILE_TYPE: 'file',
  EXE_TYPE: 'exe',
  MERCURYWM_CONTENT_URL:
    'https://wheel-org.github.io/mercurywm-scripts/extensions/',
  MERCURYWM_CONTENT_ORIGIN: 'https://wheel-org.github.io/',

  // KEY CODES
  KEY_LEFT_ARROW: 37,
  KEY_UP_ARROW: 38,
  KEY_RIGHT_ARROW: 39,
  KEY_DOWN_ARROW: 40,
  KEY_ENTER: 13,
  KEY_BACKSPACE: 8,
  KEY_DELETE: 46,
  KEY_TAB: 9
};
export default Constants;

/* Components */
export const createTerminal = (): Terminal => ({
  history: [''],
  inProg: false,
  running: false,
  output: [],
  runningCommand: '',
  params: [],
  workingDirectory: '~'
});

export const createWindow = (
  x: number,
  y: number,
  width: number,
  height: number,
  id: number
): Window => ({
  x,
  y,
  width,
  height,
  id,
  terminal: createTerminal()
});

export const createWorkspace = (id: number): Workspace => ({
  windows: [createWindow(0, 0, 100, 100, id)]
});

/* File System */
export const createDirectory = (
  name: string,
  data: Array<File | Directory> = []
): Directory => ({
  type: Constants.DIR_TYPE,
  name,
  data
});

export const createFile = (name: string, data: string = ''): File => ({
  type: Constants.FILE_TYPE,
  name,
  data
});
