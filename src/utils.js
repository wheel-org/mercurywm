import Constants from './constants';

export function getDirectory(directory, currDir) {
    const parts = directory.split('/');
    let dirStack = [currDir];
    for (let i = 1; i < parts.length; i++) {
        if (parts === '' || parts === '.') continue;
        if (parts[i] === '..') {
            currDir = dirStack[dirStack.length - 1];
            if (dirStack.length != 1) {
                dirStack.pop();
            }
            continue;
        }
        else if (parts[i] === '~') {
            // Go Back to Root
            while (dirStack.length != 1) {
                dirStack.pop();
            }
            continue;
        }
        let found = -1;
        for (let j = 0; j < currDir.data.length; j++) {
            // Found it
            if (currDir.data[j].name === parts[i] && currDir.data[j].type === Constants.DIR_TYPE) {
                found = j;
                dirStack.push(currDir.data[j]);
                break;
            }
        }
        if (found === -1) {
            return false;
        }
        currDir = dirStack[dirStack.length - 1];
    }
    let path = '';
    for (let i = 0; i < dirStack.length; i++) {
        if (i !== 0) path += '/';
        path += dirStack[i].name;
    }
    return [currDir, path];
}

export function getFile(path, currDir) {
    const end = path.lastIndexOf('/');
    if (end === -1) return false;

    const parts = path.split('/');
    const filename = parts[parts.length - 1];
    const containingDirRes = getDirectory(path.substring(0, end), currDir);
    if (containingDirRes === false) return false;

    const containingPath = containingDirRes[1];
    const containingDir = containingDirRes[0];
    for (let j = 0; j < containingDir.data.length; j++) {
        if (containingDir.data[j].type === Constants.FILE_TYPE &&
            containingDir.data[j].name === filename) {
            return [containingDir.data[j], containingPath + '/' + filename];
        }
    }
    return false;
}

export function findWindow(state, id) {
    const windows = state.workspaces[state.selectedWorkspace].windows;
    for (let i = 0; i < windows.length; i++) {
        if (windows[i].id === id) {
            return i;
        }
    }
    return -1;
}

// the following commands either returns a list of windows that are exact
//   borders of the given index, or false if there are none
function borderingComp(index, windows, borderingComp, boundaryComp1, boundaryComp2, isStrict) {
    let borderingWindows = [];
    const a = windows[index];
    for (let i = 0; i < windows.length; i++) {
        if (i !== index) {
            const b = windows[i];
            if (borderingComp(a, b)) {
                // Bordering
                if (boundaryComp1(a, b) || !isStrict) {
                    borderingWindows.push(i);
                }
                else if (!boundaryComp2(a, b)) {
                    // Borders on edge but exceeds limit.
                    return false;
                }
            }
        }
    }
    if (borderingWindows.length === 0) {
        return false;
    }
    return borderingWindows;
}

export function getBorderingLeft(index, windows, isStrict = true) {
    return borderingComp(index, windows,
        function(a, b) { return b.x + b.width === a.x; },
        function(a, b) { return b.y >= a.y && b.y + b.height <= a.y + a.height; },
        function(a, b) { return b.y >= a.y + a.height || b.y + b.height <= a.y; },
        isStrict);
}

export function getBorderingRight(index, windows, isStrict = true) {
    return borderingComp(index, windows,
        function(a, b) { return b.x === a.x + a.width; },
        function(a, b) { return b.y >= a.y && b.y + b.height <= a.y + a.height; },
        function(a, b) { return b.y >= a.y + a.height || b.y + b.height <= a.y; },
        isStrict);
}

export function getBorderingTop(index, windows, isStrict = true) {
    return borderingComp(index, windows,
        function(a, b) { return b.y + b.height === a.y; },
        function(a, b) { return b.x >= a.x && b.x + b.width <= a.x + a.width; },
        function(a, b) { return b.x >= a.x + a.width || b.x + b.width <= a.x; },
        isStrict);
}

export function getBorderingBottom(index, windows, isStrict = true) {
    return borderingComp(index, windows,
        function(a, b) { return b.y === a.y + a.height; },
        function(a, b) { return b.x >= a.x && b.x + b.width <= a.x + a.width; },
        function(a, b) { return b.x >= a.x + a.width || b.x + b.width <= a.x; },
        isStrict);
}
