import { clear } from '../storage';
import env from './env';
import window from './window';
import workspace from './workspace';
import yum from './yum';

import cd from './files/cd';
import mkdir from './files/mkdir';
import ls from './files/ls';
import cat from './files/cat';
import edit from './files/edit';
import rm from './files/rm';

import Constants from '../constants';
import { findWindow, getDirectory } from '../utils';

function parseInput(text) {
    return text.trim().match(/[^\s"']+|"([^"]*)"|'([^']*)'/g)
                      .map(t => t.replace(/^"|"$/g, "").replace(/^'|'$/g, ""));
}

function Script(state, command, params) {
    this.windowIndex = findWindow(state, state.selectedWindow);
    this.workspace = state.workspaces[state.selectedWorkspace];
    this.currWindow = this.workspace.windows[this.windowIndex];
    this.terminal = this.currWindow.terminal;
    this.output = function(text, showPrompt = false, showCommand = true) {
        this.terminal.output.push({
            text: (showCommand ? command + ': ' : '') + text,
            prompt: (showPrompt ? this.terminal.workingDirectory : '')
        });
    }
    this.execute = function(run) {
        return run.call(this, state, params, this.windowIndex);
    }
}

function executeCommand(state, text) {
    const [command, ...params] = parseInput(text);
    console.log(command, params);
    const script = new Script(state, command, params);
    const bin = getDirectory('~/bin', state.wfs);
	if (bin !== false) {
		const commands = bin[0].data.reduce((acc, d) => {
			if (d.type === Constants.FILE_TYPE) {
				acc[d.name] = d.data;
			}
			return acc;
		}, {});
		if (commands[command]) {
			let windowIndex = findWindow(state, state.selectedWindow);
			let workspace = state.workspaces[state.selectedWorkspace];
			let currWindow = workspace.windows[windowIndex];
			let terminal = currWindow.terminal;
			const code = `
				(function run(...args) {
					${commands[command]}
				})(${params.map(p => '"' + p + '"').join(',')})
			`;
			eval(code);
			return state;
		}
	}
	switch(command) {
		case 'reset':
			return clear();
		case 'clear':
			script.terminal.output = [];
			return state;
		case 'env':
			return script.execute(env);
		case 'window':
			return script.execute(window);
		case 'workspace':
			return script.execute(workspace);
		case 'cd':
			return script.execute(cd);
		case 'ls':
			return script.execute(ls);
		case 'mkdir':
			return script.execute(mkdir);
		case 'cat':
			return script.execute(cat);
		case 'edit':
			return script.execute(edit);
		case 'yum':
			return script.execute(yum);
		default: {
			const path = Constants.MERCURYWM_CONTENT_URL + command + '/index.html';
			const xml = new XMLHttpRequest();
			xml.open('GET', path, false);
			xml.send(null);
			if (xml.status == 200) {
				script.terminal.inProg = true;
				script.terminal.runningCommand = command;
				script.terminal.params = params;
			}
			else {
				script.output('command not found');
			}
		}
	
    }
    return state;
}

export default executeCommand;
