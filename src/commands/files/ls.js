import Constants, {createDirectory} from '../../constants';
import { getDirectory } from '../../utils';

function run(state, params) {
    const workingDirectory = getDirectory(this.terminal.workingDirectory, state.wfs)[0];

    if (workingDirectory.data.length === 0) {
        this.output('Directory is empty');
    }
    else {
        this.output('Directory listing for ' + this.terminal.workingDirectory);
    }
    for (let i = 0; i < workingDirectory.data.length; i++) {
        this.output(
            (workingDirectory.data[i].type === Constants.DIR_TYPE ?
                'DIR     ' :
                'FILE    ') + workingDirectory.data[i].name, false, false);
    }

    return state;
}

export default run;
