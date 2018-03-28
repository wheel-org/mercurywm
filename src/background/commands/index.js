/* @flow */

import u from 'updeep';
import Constants from 'constants.js';
import { findWindow } from 'utils';
import { clear } from '../storage';
import cat from './cat';
import cd from './cd';
import env from './env';
import kill from './kill';
import ls from './ls';
import mkdir from './mkdir';
import window from './window';
import rm from './rm';
import workspace from './workspace';

import type { StoreState, Directory } from 'types';

// Parse input into command and parameters
function parseInput(text): Array<string> {
  const tokens = text.trim().match(/[^\s"']+|"([^"]*)"|'([^']*)'/g);
  if (tokens)
    return tokens.map(t => t.replace(/^"|"$/g, '').replace(/^'|'$/g, ''));
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
      const dirIndex = directory.data.findIndex(
        item => item.type == Constants.DIR_TYPE && item.name === name
      );
      if (dirIndex >= 0) {
        this.traversePath(directory.data[dirIndex], parts.slice(1), callback);
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
      const dirIndex = directory.data.findIndex(
        item => item.type == Constants.DIR_TYPE && item.name === dirName
      );
      if (dirIndex >= 0) {
        directory.data.splice(dirIndex, 1);
      }
    });
  };
}

export function executeCommand(state: StoreState, input: string) {
  const [name, ...params] = parseInput(input);

  const command = new Command(state, name, params);

  switch (name) {
    case 'reset':
      return clear();
    case 'clear':
      // $FlowFixMe: command can mutate state
      command.terminal.output = [];
      return state;
    case 'cat':
      return cat.call(command, state, params);
    case 'cd':
      return cd.call(command, state, params);
    case 'env':
      return env.call(command, state, params);
    case 'kill':
      return kill.call(command, state, params);
    case 'ls':
      return ls.call(command, state, params);
    case 'mkdir':
      return mkdir.call(command, state, params);
    case 'rm':
      return rm.call(command, state, params);
    case 'window':
      return window.call(command, state, params);
    case 'workspace':
      return workspace.call(command, state, params);
    default:
      // $FlowFixMe: command can mutate state
      command.terminal.running = true;
      return state;
  }
}
