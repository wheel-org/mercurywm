/* @flow strict */

import { clear } from 'background/storage';
import { findWindow } from 'utils';

import type { StoreState } from 'types';

// Parse input into command and parameters
function parseInput(text): Array<string> {
    const tokens = text.trim().match(/[^\s"']+|"([^"]*)"|'([^']*)'/g);
    if (tokens) return tokens.map(t => t.replace(/^"|"$/g, '').replace(/^'|'$/g, ''));
    return [];
}

function Command(state, command, params) {
    this.windowIndex = findWindow(state, state.selectedWindow);
    this.workspace = state.workspaces[state.selectedWorkspace];
    this.currWindow = this.workspace.windows[this.windowIndex];
    this.terminal = this.currWindow.terminal;
    this.output = function(text, showPrompt = false, showCommand = true) {
        this.terminal.output.push({
            text: (showCommand ? command + ': ' : '') + text,
            prompt: showPrompt ? this.terminal.workingDirectory : ''
        });
    };
    this.traversePath = function(directory, parts, callback) {
        if (parts.length > 0 && parts[0] === '~') {
            // Remove root directory
            parts.shift();
        }

        const name = parts[0];
        if (parts.length === 1) {
            callback(directory, name);
        } else {
            const dirIndex = directory.data.findIndex(item => item.type == Constants.DIR_TYPE && item.name === name);
            if (dirIndex >= 0) {
                this.traversePath(directory.data[dirIndex], parts.slice(1), callback);
            }
            else {
                this.output('Directory traversal failed. Path not found.');
            }
        }
    };
    this.deleteFile = function(path) {
        this.traversePath(state.wfs, path.split('/'), (directory, fileName) => {
            const fileIndex = directory.data.findIndex(
                item => item.type == Constants.FILE_TYPE && item.name === fileName
            );
            if (fileIndex >= 0) {
                directory.data.splice(fileIndex, 1);
            }
        });
    };
    this.deleteDirectory = function(path) {
        this.traversePath(state.wfs, path.split('/'), (directory, dirName) => {
            const dirIndex = directory.data.findIndex(item => item.type == Constants.DIR_TYPE && item.name === dirName);
            if (dirIndex >= 0) {
                directory.data.splice(dirIndex, 1);
            }
        });
    };
}

export function isCommand(name: string) {
    const names = [
        'cat',
        'cd',
        'clear',
        'env',
        'kill',
        'ls',
        'mkdir',
        'render',
        'reset',
        'rm',
        'window',
        'workspace',
        'info'
    ];
    if (!PRODUCTION) {
        names.push('reload');
    }
    return names.find(n => n === name);
}

export function executeCommand(state: StoreState, input: string): StoreState {
    if (input === '') return state;

    const [name, ...params] = parseInput(input);

    const command = new Command(state, name, params);
    if (name === 'reset') {
        return clear();
    } else if (name === 'clear') {
        // $FlowFixMe: command can mutate state
        command.terminal.output = [];
        return state;
    } else if (isCommand(name)) {
        return require('./' + name).default.call(command, state, params);
    } else {
        // $FlowFixMe: command can mutate state
        command.terminal.running = true;
        return state;
    }
}
