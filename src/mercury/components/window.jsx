/* @flow */

import * as React from 'react';
import { connect } from 'react-redux';

import TerminalLink from './terminal-link.jsx';
import Constants from 'constants.js';

import type { StoreState, Dispatch, Window as WindowType } from 'types';

type StateProps = {|
  +env: Object
|};

type DispatchProps = {|
  +onClick: number => void
|};

type Props = {|
  +window: WindowType,
  +index: number,
  +selected: boolean,
  ...StateProps,
  ...DispatchProps
|};

class Window extends React.Component<Props> {
  cacheParamValue = Date.now();

  render() {
    const { window, index, selected, onClick, env } = this.props;

    return (
      <div
        className="window-box"
        onClick={() => onClick(window.id)}
        style={{
          width: window.width + '%',
          height: window.height + '%',
          left: window.x + '%',
          top: window.y + '%'
        }}
      >
        {window.terminal.running ? (
          <iframe
            className="window-frame"
            src={
              Constants.MERCURYWM_CONTENT_URL +
              window.terminal.runningCommand +
              '/index.html' +
              '?workingDirectory=' +
              window.terminal.workingDirectory +
              '&cache=' +
              this.cacheParamValue +
              '&id=' +
              window.id +
              '&env=' +
              encodeURIComponent(JSON.stringify(env)) +
              '&params=' +
              encodeURIComponent(JSON.stringify(window.terminal.params))
            }
          />
        ) : (
          <span>
            <div className={'window' + (selected ? ' selected' : ' ')}>
              <TerminalLink terminal={window.terminal} selected={selected} />
            </div>
            <div className="window-info">
              <span>
                {index} ({window.id})
              </span>
              <span style={{ float: 'right' }}>
                {window.x}, {window.y}, {window.width}, {window.height}
              </span>
            </div>
          </span>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state: StoreState): StateProps => ({
  env: state.wsh.env
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
  onClick: id => {
    dispatch({
      type: 'SELECT_WINDOW',
      id
    });
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Window);
