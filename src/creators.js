/* @flow */

import type { Directory, File, Terminal, Window, Workspace } from 'types';

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
