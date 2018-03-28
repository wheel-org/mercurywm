/* @flow
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
import Constants from 'constants.js';
import { getFile } from 'utils';

import type { StoreState, Dispatch } from 'types';

type StateProps = {|
  +loaded: boolean
|};

type DispatchProps = {|
  +selectWorkspace: number => void,
  +selectWindow: number => void,
  +killScript: number => void,
  +setEnv: (string, string) => void,
  +createOrModifyFile: (string, string) => void
|};

type Props = {| ...StateProps, ...DispatchProps |};

class Root extends React.Component<Props> {
  componentWillMount() {
    window.addEventListener(
      'keydown',
      (e: KeyboardEvent) => this._handleSystemKey(e),
      true
    );
    window.addEventListener(
      'message',
      (e: MessageEvent) => this._receiveMessage(e),
      false
    );
  }

  render() {
    return this.props.loaded ? <App /> : <Loading />;
  }

  _handleSystemKey(e: KeyboardEvent) {
    if (
      (e.keyCode === Constants.KEY_LEFT_ARROW ||
        e.keyCode === Constants.KEY_RIGHT_ARROW) &&
      e.altKey
    ) {
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

  _receiveMessage(event: MessageEvent) {
    if (
      event.origin + '/' !== Constants.MERCURYWM_CONTENT_ORIGIN ||
      typeof event.data !== 'string'
    ) {
      return;
    }

    const message = event.data;
    const [command, ...parts] = event.data.split('|');
    if (command === 'done') {
      this.props.killScript(parseInt(parts[0]));
    } else if (command === 'env') {
      this.props.setEnv(parts[0], parts[1]);
    } else if (command === 'requestFile') {
      const result = getFile(message.substring(message.indexOf('|') + 1));
      const contents = result ? result.data : '';
      event.source.postMessage('file|' + contents, event.origin);
    } else if (command === 'writeFile') {
      this.props.createOrModifyFile(
        parts[0],
        message
          .split('|')
          .slice(2)
          .join('|')
      );
    }
  }
}

const mapStateToProps = (state: StoreState): StateProps => ({
  loaded: state.loaded
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
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

module.exports = connect(mapStateToProps, mapDispatchToProps)(Root);
