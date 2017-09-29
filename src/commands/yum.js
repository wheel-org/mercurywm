import Constants from '../constants';
import { createOrModifyFileAtPath } from '../utils';

function run(state, params) {
	if (params.length === 0) {
		this.output("spaghetti sauce");
	}
	else if (params.length === 2) { 
		// Pull URL
		var file = this.terminal.workingDirectory + "/" + params[1];
		this.output("downloading " + params[0] + "...");
		var xmlRequest = new XMLHttpRequest();
		xmlRequest.open("GET", params[0], false);
		xmlRequest.send(null);
		if (xmlRequest.status == 200) {
			this.output("download success");
			this.output("data written to file " + file);
			createOrModifyFileAtPath(file, xmlRequest.responseText, state.wfs);
		}
		else {
			this.output("download failed: status " + xmlRequest.status);
		}
	}
	else {
		this.output('Incorrect number of parameters');
	}
    return state;
}

export default run;
