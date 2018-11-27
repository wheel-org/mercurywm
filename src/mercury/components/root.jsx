/* @flow strict
 * root.jsx
 * Renders the app when data is loaded, or shows the loading page
 * Handles global key listeners and iframe message listeners
 * Shouldn't access the store as it might be loading,
 * but everything else (<App/> onwards) is guaranteed to be loaded
 */

import * as React from 'react';
import { connect } from 'react-redux';

import App from './app.jsx';
import Loading from './loading.jsx';
import { getFile } from 'utils';
// This is only here because getDirectory needs the file system is a parameter
// For other state needs, use connect!
import store from 'mercury/store';

import type { StoreState, Dispatch, ExtensionMessage, ExtensionResponse } from 'types';

type StateProps = {|
    +loaded: boolean
|};

type DispatchProps = {|
    +selectWindowDirect: number => void,
    +selectWorkspace: number => void,
    +selectWindow: number => void,
    +killScript: number => void,
    +setEnv: (string, string) => void,
    +createOrModifyFile: (string, string) => void
|};

type Props = StateProps & DispatchProps;

class Root extends React.Component<Props> {
    componentDidMount() {
        window.addEventListener('keydown', (e: KeyboardEvent) => this.handleSystemKey(e), true);
        window.addEventListener('message', (e: MessageEvent) => this.receiveMessage(e), false);
    }

    render() {
        return this.props.loaded ? <App /> : <Loading />;
    }

    handleSystemKey(e: KeyboardEvent) {
        if ((e.keyCode === Constants.KEY_LEFT_ARROW || e.keyCode === Constants.KEY_RIGHT_ARROW) && e.altKey) {
            e.preventDefault();
            this.props.selectWorkspace(e.keyCode);
        } else if (
            [
                Constants.KEY_LEFT_ARROW,
                Constants.KEY_RIGHT_ARROW,
                Constants.KEY_UP_ARROW,
                Constants.KEY_DOWN_ARROW
            ].indexOf(e.keyCode) > -1 &&
            e.shiftKey
        ) {
            e.preventDefault();
            this.props.selectWindow(e.keyCode);
        }
    }

    receiveMessage(event: MessageEvent) {
        if (
            (event.origin + '/' !== Constants.MERCURYWM_ORIGIN) ||
            typeof event.data !== 'string'
        ) {
            return;
        }

        const message: ExtensionMessage = JSON.parse(event.data);
        switch (message.type) {
            case 'done':
                this.props.killScript(parseInt(message.id));
                break;
            case 'env':
                this.props.setEnv(message.key, message.value);
                break;
            case 'requestFile': {
                const result = getFile(message.path, store.getState().wfs);
                const contents = result ? result.data : '';
                this.sendMessage(event, { type: 'file', path: message.path, contents });
                break;
            }
            case 'writeFile':
                this.props.createOrModifyFile(message.path, message.content);
                break;
            case 'selectWindow':
                this.props.selectWindowDirect(Number(message.id));
                break;
        }
    }

    sendMessage(event: MessageEvent, message: ExtensionResponse) {
        event.source.postMessage(JSON.stringify(message), event.origin);
    }
}

const mapStateToProps = (state: StoreState): StateProps => ({
    loaded: state.loaded
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    selectWindowDirect: (id: number) =>
        dispatch({
            type: 'SELECT_WINDOW',
            id
        }),
    selectWorkspace: (direction: number) =>
        dispatch({
            type: 'INTENT_SELECT_WORKSPACE',
            direction
        }),
    selectWindow: (direction: number) =>
        dispatch({
            type: 'INTENT_SELECT_WINDOW',
            direction
        }),
    killScript: (id: number) =>
        dispatch({
            type: 'KILL_SCRIPT',
            id
        }),
    setEnv: (key: string, value: string) =>
        dispatch({
            type: 'SET_ENV',
            key,
            value
        }),
    createOrModifyFile: (path: string, content: string) =>
        dispatch({
            type: 'CREATE_OR_MODIFY_FILE',
            path,
            content
        })
});

const ConnectedComp: React.ComponentType<{||}> = connect(
  mapStateToProps,
  mapDispatchToProps
)(Root);

export default ConnectedComp;
