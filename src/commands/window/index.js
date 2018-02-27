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
            this.workspace.windows.forEach(({terminal}, i) => {
                let outputString = '[' + i + '] ';
                if (terminal.inProg) {
                    outputString += 'Running: ' + terminal.runningCommand + ' ' + terminal.params.join(' ');
                }
                else {
                    outputString += 'Idle';
                }
                this.output(outputString);
            });
            return state;
        default:
            this.output('Unknown parameter ' + params[0]);
            return state;
    }
}

export default run;
