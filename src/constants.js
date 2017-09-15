/* Constants */
const Constants = {
    // CONSTANTS
    STATE_KEY: 'state',
    DIR_TYPE: 'dir',
    FILE_TYPE: 'file',
    MERCURYWM_CONTENT_URL: 'https://wheel-org.github.io/mercurywm-scripts/',
    MERCURYWM_CONTENT_ORIGIN: 'https://wheel-org.github.io/',

    // KEY CODES
    KEY_LEFT_ARROW: 37,
    KEY_UP_ARROW: 38,
    KEY_RIGHT_ARROW: 39,
    KEY_DOWN_ARROW: 40,
    KEY_ENTER: 13,
    KEY_BACKSPACE: 8,
    KEY_TAB: 9
};
export default Constants;

/* Components */

export const createTerminal = () => ({
    history: [''],
    inProg: false,
    output: [],
    runningCommand: '',
    params: [],
    workingDirectory: '~'
});

export const createWindow = (x, y, width, height, id) => ({
    x,
    y,
    width,
    height,
    id,
    terminal: createTerminal()
});

export const createWorkspace = id => ({
    windows: [createWindow(0, 0, 100, 100, id)]
});

/* File System */

export const createDirectory = (name) => ({
    type: Constants.DIR_TYPE,
    name,
    data: []
});

export const createFile = name => ({
    type: Constants.FILE_TYPE,
    name,
    data: ''
});

export const createAlias = (alias, command) => ({
    alias,
    command
});
