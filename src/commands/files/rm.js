import Constants from '../../constants';
import { getFile, getDirectory, deleteFile, deleteDirectory } from '../../utils';
function run(state, params) {
	if (params.length === 2) {
		if (params[0] != "-f" && params[0] != "-d") {
			this.output(params[0] + " is an invalid flag")
		}
		else if (params[0] == "-f") {
			const fileResult = getFile(this.terminal.workingDirectory + "/" + params[1], state.wfs);
			if (fileResult === false) {
				this.output(params[0] + ' was not found');
			}
			else {
				deleteFile(fileResult[1], state.wfs);
			}
		}
		else {
			var directoryResult = getDirectory(this.terminal.workingDirectory + "/" + params[1], state.wfs);
			if (directoryResult === false) {
				this.output(params[0] + ' was not found');
			}
			else {
				if (this.terminal.workingDirectory.startsWith(directoryResult[1])) {
					this.output(params[1] + " leads to current working directory, cannot delete");
				}
				else {
					deleteDirectory(directoryResult[1], state.wfs);
				}
			}
		}
	}
	else if (params.length === 1) {
		var fileResult = getFile(this.terminal.workingDirectory + "/" + params[0], state.wfs);
		var directoryResult = getDirectory(this.terminal.workingDirectory + "/" + params[0], state.wfs);
		if (!fileResult && !directoryResult) {
			this.output(params[0] + " was not found");
		}
		else if (fileResult && directoryResult) {
			this.output(params[0] + " is both a file and a directory, use -f and -d flags to specify");
		}
		else if (fileResult) {
			deleteFile(fileResult[1], state.wfs);
		}
		else {
			if (this.terminal.workingDirectory.startsWith(directoryResult[1])) {
				this.output(params[1] + " leads to current working directory, cannot delete");
			}
			else {
				deleteDirectory(directoryResult[1], state.wfs);
			}
		}
	}
	else {
        this.output('Incorrect number of parameters');
    }

    return state;
}

export default run;
