import Constants, { createWorkspace } from './constants';

// INITIAL STATE
const id = Date.now();
const defaultStateObject = { [Constants.STATE_KEY]: {
    workspaces: [createWorkspace(id)],
    wfs: {
        type: Constants.DIR_TYPE,
        name: '~',
        data: [{
            type: Constants.FILE_TYPE,
            name: 'Welcome',
            data: 'Welcome to MercuryWM! Here is some information about some stuff!\n'
        }, {
            type: Constants.DIR_TYPE,
            name: 'bin',
            data: [{
                type: Constants.FILE_TYPE,
                name: 'echo',
                data: `script.output(args.join(" "), false, false);`
            }]
        }]
    },
    wsh: {
        // environmental variables
        env: {
            'background': '#aaa',
            'prompt': '%w $ ',
            'username': 'MercuryWM',
        },
        // alias mappings
        aliases: []
    },
    selectedWindow: id,
    selectedWorkspace: 0
}};

function load(callback) {
    chrome.storage.local.get(defaultStateObject, data => {
        callback(data[Constants.STATE_KEY]);
    });
}

function clear() {
    chrome.storage.local.clear(() => {
        const error = chrome.runtime.lastError;
        if (error) {
            console.error(error);
        }
    });
    return defaultStateObject[Constants.STATE_KEY];
}

function save(state) {
    chrome.storage.local.set({ [Constants.STATE_KEY]: state });
}

module.exports = {
    clear,
    load,
    save
};
