/* @flow */

import type { Directory, File, Terminal, Window, Workspace } from 'types';

const MERCURY_BASE_URL = 'https://wheel-org.github.io/mercurywm-scripts/';

/* Constants */
const Constants = {
    NAME: 'Mercury WM',
    VERSION: '1.1',
    STATE_KEY: 'state',
    DIR_TYPE: 'dir',
    FILE_TYPE: 'file',
    EXE_TYPE: 'exe',
    MERCURYWM_URL: MERCURY_BASE_URL,
    MERCURYWM_CONTENT_URL: MERCURY_BASE_URL + 'extensions/',

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
    running: false,
    isExtension: false,
    output: [],
    runningCommand: '',
    params: [],
    workingDirectory: '~'
});

export const createWindow = (x: number, y: number, width: number, height: number, id: number): Window => ({
    x,
    y,
    width,
    height,
    id,
    terminal: createTerminal()
});

export const createWorkspace = (
    id: number,
    windows: Array<Window> = [createWindow(0, 0, 100, 100, id)]
): Workspace => ({
    windows
});

/* File System */
export const createDirectory = (name: string, data: Array<File | Directory> = []): Directory => ({
    type: Constants.DIR_TYPE,
    name,
    data
});

export const createFile = (name: string, data: string = ''): File => ({
    type: Constants.FILE_TYPE,
    name,
    data
});
