/* Constants */
const Constants = {
	// CONSTANTS
	NAME: 'Mercury WM',
	VERSION: '1.1',
    STATE_KEY: 'state',
    DIR_TYPE: 'dir',
    FILE_TYPE: 'file',
    EXE_TYPE: 'exe',
    MERCURYWM_CONTENT_URL: 'https://wheel-org.github.io/mercurywm-scripts/extensions/',
    MERCURYWM_CONTENT_ORIGIN: 'https://wheel-org.github.io/',

    // KEY CODES
    KEY_LEFT_ARROW: 37,
    KEY_UP_ARROW: 38,
    KEY_RIGHT_ARROW: 39,
    KEY_DOWN_ARROW: 40,
    KEY_ENTER: 13,
	KEY_BACKSPACE: 8,
	KEY_DELETE: 46,
    KEY_TAB: 9
};
export default Constants;

export const mmmCode = `// mmm: MercuryWM Module Manager
// Argument checking
if (args.length === 0) {
    script.output("mmm: MercuryWM Module Manager");
    script.output("Usage: mmm [MODULE]")
    return;
}
else if (args.length > 1) {
    script.output("Invalid number of arguments: expected 1, got " + args.length);
    return;
}

// Find module
var module = args[0];
script.output("Searching for module " + module);

function getData(url) {
    var xml = new XMLHttpRequest();
    xml.open("GET", url, false);
    xml.send(null);
    if (xml.status == 200) return xml.responseText;
    return "";
}

var url = "https://raw.githubusercontent.com/wheel-org/mercurywm-scripts/master/modules/" + module + "/";

var version = getData(url + "VERSION");
if (!version) {
    script.output("Could not found module " + module);
    return;
}

// Load module
script.output("Retrieving version " + version);
var code = getData(url + version + "/main.js");
if (!code) {
    script.output("Could not retrieve module " + module + "@" + version);
    return;
}

// Save module to file system
var bin = script.state.wfs.data.filter(d => d.name === "bin" && d.type === "dir")[0];

var find = bin.data.filter(d => d.name === module && d.type === "file")[0];
if (find) {
    script.output("Module already exists, overwriting");
    find.data = code;
}
else {
    script.output("Saving to file system");
    bin.data.push({
        type: "file",
        name: module,
        data: code
    });
}

// Load man page
script.output("Retrieving man page");
var man = getData(url + version + "/man.md");
if (!man) {
    script.output("Could not retrieve man page for " + module + "@" + version);
    return;
}
script.output("\\n\\n");
script.output(man);
`;

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

export const createDirectory = (name, data = []) => ({
    type: Constants.DIR_TYPE,
    name,
    data
});

export const createFile = (name, data = '') => ({
    type: Constants.FILE_TYPE,
    name,
    data
});

export const createAlias = (alias, command) => ({
    alias,
    command
});
