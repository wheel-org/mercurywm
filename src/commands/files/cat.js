import Constants from '../../constants';
import { getFile } from '../../utils';

function run(state, params) {
    if (params.length === 1) {
        const navResult = getFile(this.terminal.workingDirectory + "/" + params[0], state.wfs);
        if (navResult === false) {
            this.output(params[0] + ' was not found');
        }
        else {
            this.output(navResult[0].data, false, false);
        }
    }
    else {
        this.output('Incorrect number of parameters');
    }

    return state;
}

export default run;
