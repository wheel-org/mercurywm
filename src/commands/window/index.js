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
        default:
            this.output('Unknown parameter ' + params[0]);
            return state;
    }
}

export default run;
