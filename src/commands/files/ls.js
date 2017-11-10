import Constants, {createDirectory} from '../../constants';
import { getDirectory } from '../../utils';

function run(state, params) {
    const showHidden = params.length > 0 && params[0] === '-a';

    const workingDirectory = getDirectory(this.terminal.workingDirectory, state.wfs)[0];

    if (workingDirectory.data.length === 0) {
        this.output('Directory is empty');
    }
    else {
        this.output('Directory listing for ' + this.terminal.workingDirectory);
	}
	workingDirectory.data.sort(function (a, b) { 
		if (a.type === Constants.DIR_TYPE && b.type !== Constants.DIR_TYPE) {
			return -1;
		}
		else if (b.type === Constants.DIR_TYPE && a.type !== Constants.DIR_TYPE) {
			return 1;
		}
		else { 
			if (a.name < b.name) return -1;
			else if (a.name > b.name) return 1;
			else return 0;
		}
	});

    workingDirectory.data.forEach(element => {
        if (element.name[0] !== '.' || showHidden) {
            if (element.type === Constants.DIR_TYPE) {
                this.output('DIR     ' + element.name, false, false);
            }
            else if (element.type === Constants.FILE_TYPE) {
                this.output('FILE    ' + element.name, false, false);
            }
            else if (element.type === Constants.EXE_TYPE) {
                this.output('EXE     ' + element.name, false, false);
            }
        }
    });

    return state;
}

export default run;
