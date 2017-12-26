function run(state, params) {
	if (params.length === 1) {
		const index = parseInt(params[0]);
		if (index >= 0 && index < this.workspace.windows.length) {
			if (this.workspace.windows[index].terminal.inProg) {
				this.workspace.windows[index].terminal.inProg = false;
				this.output('Extension killed');
			}
			else {
				this.output('Nothing running in window');
			}
		}
		else {
			this.output('Invalid parameter');
		}
	}
	else {
		this.output('Incorrect number of parameters');
	}
	return state;
}

export default run;
