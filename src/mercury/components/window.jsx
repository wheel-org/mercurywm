/* @flow strict */

import * as React from 'react';
import { connect } from 'react-redux';

import TerminalLink from './terminal-link.jsx';

import type { StoreState, Dispatch, Window as WindowType } from 'types';

type StateProps = {|
  +env: Object
|};

type DispatchProps = {|
  +onClick: number => void
|};

type PassedProps = {|
  +window: WindowType,
  +index: number,
  +selected: boolean
|};

type Props = PassedProps & StateProps & DispatchProps;

class Window extends React.Component<Props> {
  cacheParamValue = Date.now();

  renderFile() {
    const { window, env } = this.props;

    const urlEnd =
      'render.html?runningCommand=' +
      window.terminal.runningCommand +
      '&workingDirectory=' +
      window.terminal.workingDirectory +
      '&cache=' +
      this.cacheParamValue +
      '&id=' +
      window.id +
      '&env=' +
      encodeURIComponent(JSON.stringify(env)) +
      '&params=' +
      encodeURIComponent(JSON.stringify(window.terminal.params));

    const renderURL =
      process.env.MERCURY_TARGET === 'web'
        ? urlEnd
        : chrome.runtime.getURL(urlEnd);

    return <iframe className="window-frame" src={renderURL} />;
  }

  renderExtension() {
    const { window, env } = this.props;
    return (
      <iframe
        className="window-frame"
        src={
          Constants.MERCURYWM_CONTENT_URL +
          window.terminal.runningCommand +
          '/index.html?workingDirectory=' +
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
    );
  }

  renderTerminal() {
    const { window, index, selected } = this.props;
    return (
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
    );
  }

  render() {
    const { window, onClick, env } = this.props;
    const padding = env.windowPadding || 10;

    return (
      <div
        className="window-box"
        onClick={() => onClick(window.id)}
        style={{
          width: window.width + '%',
          height: window.height + '%',
          left: window.x + '%',
          top: window.y + '%',
          padding: padding + 'px 0 0 ' + padding + 'px'
        }}
      >
        {window.terminal.isExtension
          ? window.terminal.runningCommand === 'render'
            ? this.renderFile()
            : this.renderExtension()
          : this.renderTerminal()}
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

const ConnectedComp: React.ComponentType<PassedProps> = connect(
  mapStateToProps,
  mapDispatchToProps
)(Window);

export default ConnectedComp;
