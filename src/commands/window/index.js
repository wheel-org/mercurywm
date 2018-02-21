import merge from './merge';
import split from './split';
import shift from './shift';

function run(state, params) {
    switch(params[0]) {
        case 'vs':
        case 'hs':
            return this.execute(split);
        case 'merge':
            return this.execute(merge);
        case 'left':
        case 'right':
        case 'top':
        case 'bottom':
            return this.execute(shift);
        case 'list':
            this.output('In this workspace:');
            for (var i = 0; i < this.workspace.windows.length; i++) {
                var outputString = "[" + i + "] ";
                if (this.workspace.windows[i].terminal.inProg) {
                    outputString += "Running: ";
                    outputString += this.workspace.windows[i].terminal.runningCommand + " ";
                    outputString += this.workspace.windows[i].terminal.params.join(" ");
                }
                else {
                    outputString += "Idle"
                }
                this.output(outputString)
            }
            return state;
        default:
            this.output('Unknown parameter ' + params[0]);
            return state;
    }
}

export default run;
