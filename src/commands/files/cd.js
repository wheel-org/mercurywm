import Constants from '../../constants';
import { getDirectory } from '../../utils';

function run(state, params) {
    if (params.length === 0) {
        this.terminal.workingDirectory = '~';
    }
    else if (params.length === 1) {
        const navResult = getDirectory(this.terminal.workingDirectory + '/' + params[0], state.wfs);
        if (navResult) {
            this.terminal.workingDirectory = navResult[1];
        }
        else {
            this.output('No such directory ' + params[0]);
        }
    }
    else {
        this.output('Incorrect number of parameters');
    }

    return state;
}

export default run;
