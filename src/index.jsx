import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux'
import { createStore } from 'redux';

import reducers from './reducers';

import Storage from './storage';
import App from './containers/app.jsx';
import Constants, {createFile} from './constants';
import { getDirectory, getFile } from './utils';

// Storage.clear();
Storage.load(newState => {
    console.log(newState);
    let store = createStore(reducers, newState);
    // chrome.storage.onChanged.addListener((changes, namespace) => {
    //     store.dispatch({
    //         type: 'STORAGE_CHANGED',
    //         data: changes['state'].newValue
    //     });
    // });

    window.getState = () => store.getState();

    render(
        <Provider store={store}>
            <App />
        </Provider>,
        document.getElementById('root')
    );

    window.addEventListener("keydown", handleSystemKey, false);

    function handleSystemKey(e) {
        if ((e.keyCode === Constants.KEY_LEFT_ARROW || e.keyCode === Constants.KEY_RIGHT_ARROW) && e.altKey) {
            store.dispatch({
                type: 'INTENT_SELECT_WORKSPACE',
                direction: e.keyCode
            });
            e.preventDefault();
        }
        else if ([Constants.KEY_LEFT_ARROW, Constants.KEY_RIGHT_ARROW,
                  Constants.KEY_UP_ARROW, Constants.KEY_DOWN_ARROW].indexOf(e.keyCode) > -1
                  && e.shiftKey) {
            store.dispatch({
                type: 'INTENT_SELECT_WINDOW',
                direction: e.keyCode
            });
            e.preventDefault();
        }
    }

    window.addEventListener("message", receiveMessage, false);

    function receiveMessage(event) {
        if (event.origin + '/' === Constants.MERCURYWM_CONTENT_ORIGIN) {
            const message = event.data;
            const parts = event.data.split("|");
            if (parts[0] === 'done') {
                store.dispatch({
                    type: 'KILL_SCRIPT',
                    id: parseInt(parts[1])
                });
            }
            else if (parts[0] === 'env') {
                store.dispatch({
                    type: 'SET_ENV',
                    key: parts[1],
                    value: parts[2]
                });
            }
            else if (parts[0] === 'requestFile') {
                const result = getFile(message.substring(message.indexOf('|') + 1), store.getState().wfs);
                let contents = '';
                if (result !== false) {
                    contents = result[0].data;
                }
                event.source.postMessage('file|' + contents, event.origin);
            }
            else if (parts[0] === 'writeFile') {
                createOrModifyFileAtPath(parts[1], message.split('|').slice(2).join('|'), store.getState().wfs);
            }
        }
    }

});

function createOrModifyFileAtPath(path, contents, wfs) {
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
