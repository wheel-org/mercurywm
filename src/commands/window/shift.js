import {getBorderingLeft, getBorderingRight, getBorderingTop, getBorderingBottom} from '../../utils';
// edge is one of left, right, top, or bottom
// c is 1 for +, -1 for -
function getChangeMatrix(edge, c) {
    // c is current, r is rest, d is delta
    // returns [dcx, dcy, dcw, dch, drx, dry, drw, drh]
    if (edge === 'left') {
        return [-c, 0, c, 0, 0, 0, -c, 0];
    }
    else if (edge === 'right') {
        return [0, 0, c, 0, c, 0, -c, 0];
    }
    else if (edge === 'top') {
        return [0, -c, 0, c, 0, 0, 0, -c];
    }
    else {
        return [0, 0, 0, c, 0, c, 0, -c];
    }
}

function run(state, params, windowIndex) {
    let result;
    if (params[0] === 'left') {
        result = getBorderingLeft(windowIndex, this.workspace.windows);
    }
    else if (params[0] === 'right') {
        result = getBorderingRight(windowIndex, this.workspace.windows);
    }
    else if (params[0] === 'top') {
        result = getBorderingTop(windowIndex, this.workspace.windows);
    }
    else if (params[0] === 'bottom') {
        result = getBorderingBottom(windowIndex, this.workspace.windows);
    }

    if (result) {
        const change = params[1] === '+' ? 1 :
                       params[1] === '-' ? -1 :
                       parseInt(params[1]);

        const c = getChangeMatrix(params[0], change);
        this.currWindow.x += c[0];
        this.currWindow.y += c[1];
        this.currWindow.width += c[2];
        this.currWindow.height += c[3];
        result.map(id => {
            this.workspace.windows[id].x += c[4];
            this.workspace.windows[id].y += c[5];
            this.workspace.windows[id].width += c[6];
            this.workspace.windows[id].height += c[7];
        });
    }
    else {
        this.output('Cannot shift ' + params[1] + ' border');
    }
    return state;
}

export default run;
