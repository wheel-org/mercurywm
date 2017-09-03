import Constants, {createFile} from '../../constants';
import { getDirectory, getFile } from '../../utils';

function run(state, params, windowId) {
    const workingDirectory = getDirectory(this.terminal.workingDirectory, state.wfs)[0];

    if (params.length === 1) {
        const path = this.terminal.workingDirectory + '/' + params[0];
        const navResult = getFile(path);
        let text = '';
        if (navResult === false) {
            createFile(params[0]);
        }
        else {
            text = navResult[0].data;
        }
        const result = window.prompt('Editing' + path + ':', text);
        if (result !== null) {
            getFile(path, state.wfs)[0].data = result;
        }
    }
    else {
        this.output('Incorrect number of parameters', false);
    }

    return state;
}

export default run;
