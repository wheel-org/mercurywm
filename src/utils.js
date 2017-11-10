import Constants from './constants';
import { createFile } from './constants';

export function getDirectory(directory, currDir) {
    const parts = directory.split('/');
    let dirStack = [currDir];
    for (let i = 1; i < parts.length; i++) {
        if (parts[i] === '..') {
            currDir = dirStack[dirStack.length - 1];
            if (dirStack.length !== 1) {
                dirStack.pop();
            }
        }
        else if (parts[i] === '~') {
            // Go Back to Root
            dirStack = dirStack.slice(0, 1);
        }
        else if (parts !== '' && parts !== '.') {
            const next = currDir.data.find(element => element.name === parts[i] && element.type === Constants.DIR_TYPE);
            if (next) {
                dirStack.push(next);
                currDir = next;
            }
            else {
                return false;
            }
        }
    }
    let path = dirStack.join('/');
    return [currDir, path];
}

export function getFile(path, currDir) {
    const end = path.lastIndexOf('/');
    if (end > -1) {
        const parts = path.split('/');
        const filename = parts[parts.length - 1];
        const containingDirRes = getDirectory(path.substring(0, end), currDir);

        if (containingDirRes) {
            const [containingDir, containingPath] = containingDirRes;
            for (let j = 0; j < containingDir.data.length; j++) {
                if (containingDir.data[j].type === Constants.FILE_TYPE && containingDir.data[j].name === filename) {
                    return [containingDir.data[j], containingPath + '/' + filename];
                }
            }
        }
    }
    return false;
}

export function createOrModifyFileAtPath(path, contents, wfs) {
    let fileObject = getFile(path, wfs);
    const parts = path.split("/");
    if (fileObject === false) {
        // Need to Create
        let enclosingDir = getDirectory(path.substring(0, path.lastIndexOf("/")), wfs);
        if (enclosingDir !== false) {
            let newFile = createFile(parts[parts.length - 1]);
            newFile.data = contents;
            enclosingDir[0].data.push(newFile);
        }
    }
    else {
        fileObject[0].data = contents;
    }
}

export function findWindow(state, id) {
    if (state.selectedWorkspace >= state.workspaces.length) {
        return -1;
    }
    const windows = state.workspaces[state.selectedWorkspace].windows;
    return windows.findIndex(w => w.id === id) || -1;
}

function deleteObject(path, type, currDir) {
    var containingDirRes = getDirectory(path.substring(0, path.lastIndexOf("/")), currDir);
    var name = path.substring(path.lastIndexOf("/") + 1, path.length);
    for (var j = 0; j < containingDirRes[0].data.length; j++) {
        if (containingDirRes[0].data[j].name === name &&
                containingDirRes[0].data[j].type == type) {
            containingDirRes[0].data.splice(j, 1);
        }
    }
}

export function deleteDirectory(path, currDir) {
    deleteObject(path, Constants.DIR_TYPE, currDir);
}

export function deleteFile(path, currDir) {
    deleteObject(path, Constants.FILE_TYPE, currDir);
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
        (a, b) => b.x + b.width === a.x,
        (a, b) => b.y >= a.y && b.y + b.height <= a.y + a.height,
        (a, b) => b.y >= a.y + a.height || b.y + b.height <= a.y,
        isStrict
    );
}

export function getBorderingRight(index, windows, isStrict = true) {
    return borderingComp(index, windows,
        (a, b) => b.x === a.x + a.width,
        (a, b) => b.y >= a.y && b.y + b.height <= a.y + a.height,
        (a, b) => b.y >= a.y + a.height || b.y + b.height <= a.y,
        isStrict
    );
}

export function getBorderingTop(index, windows, isStrict = true) {
    return borderingComp(index, windows,
        (a, b) => b.y + b.height === a.y,
        (a, b) => b.x >= a.x && b.x + b.width <= a.x + a.width,
        (a, b) => b.x >= a.x + a.width || b.x + b.width <= a.x,
        isStrict
    );
}

export function getBorderingBottom(index, windows, isStrict = true) {
    return borderingComp(index, windows,
        (a, b) => b.y === a.y + a.height,
        (a, b) => b.x >= a.x && b.x + b.width <= a.x + a.width,
        (a, b) => b.x >= a.x + a.width || b.x + b.width <= a.x,
        isStrict
    );
}
