import Constants, {createDirectory} from '../../constants';
import { getDirectory } from '../../utils';

function run(state, params) {
    if (params.length === 1) {
        if (getDirectory(this.terminal.workingDirectory + '/' + params[0], state.wfs)) {
            this.output(params[0] + ': Directory already exists');
        }
        else {
            getDirectory(this.terminal.workingDirectory, state.wfs)[0].data.push(createDirectory(params[0]));
        }
    }
    else {
        this.output('Incorrect number of parameters');
    }

    return state;
}

export default run;
