/* Merge */
function merge(a, b) {
    console.log(a,b);
    if (a.x === b.x && a.width === b.width && (a.y + a.height === b.y || b.y + b.height === a.y)) {
        // vertical merge
        a.y = Math.min(a.y, b.y);
        a.height += b.height;
        return true;
    }
    else if (a.y === b.y && a.height === b.height && (a.x + a.width === b.x || b.x + b.width === a.x)) {
        // horizontal merge
        a.x = Math.min(a.x, b.x);
        a.width += b.width;
        return true;
    }
    return false;
}

function run(state, params, windowIndex) {
    if (params[1] === 'all') {
        this.workspace.windows = [{
            ...this.workspace.windows[windowIndex],
            width: 100,
            height: 100,
            x: 0,
            y: 0
        }];
    }
    else if (params.length === 3 && params[1] !== params[2] 
            && params[1] >= 0 && params[1] < this.workspace.windows.length 
            && params[2] >= 0 && params[2] < this.workspace.windows.length
            && merge(this.workspace.windows[parseInt(params[1])], 
                     this.workspace.windows[parseInt(params[2])])) {
        this.workspace.windows.splice(params[2], 1);
    }
    else if (params[1] >= 0 && params[1] < this.workspace.windows.length &&
            merge(this.workspace.windows[windowIndex], this.workspace.windows[parseInt(params[1])])) {
        this.workspace.windows.splice(params[1], 1);
    }
    else {
        this.output('Cannot merge ' + params[1]);
    }
    return state;
}

export default run;
