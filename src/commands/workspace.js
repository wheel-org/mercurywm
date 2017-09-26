import { createWorkspace } from '../constants';

function run(state, params) {
    if (params.length === 1) {
        if (params[0] === 'add') {
            state.workspaces.push(createWorkspace(Date.now()));
        }
        else if (params[0] >= 0 && params[0] < state.workspaces.length) {
            const newIndex = parseInt(params[0]);
            state.selectedWorkspace = newIndex;
            state.selectedWindow = state.workspaces[newIndex].windows[0].id;
        }
        else {
            this.output('Unknown parameter ' + params[0]);
        }
    }
    else if (params.length === 2) {
        if (params[0] === 'remove') {
            if (params[1] < 0 || params[1] >= state.workspaces.length) {
                this.output('Invalid workspace id ' + params[1]);
            }
            else if (state.workspaces.length === 1) {
                this.output('Cannot have zero workspaces');
            }
            else {
                if (parseInt(params[1]) === state.selectedWorkspace) {
                    state.selectedWorkspace = 0;
                    state.selectedWindow = state.workspaces[0].windows[0].id;
                }
                state.workspaces.splice(params[1], 1);
            }

        }
        else {
            this.output('Unknown parameter ' + params[0]);
        }
    }
    else {
        this.output('Incorrect number of parameters');
    }
    return state;
}

export default run;
