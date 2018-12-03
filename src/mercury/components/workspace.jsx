/* @flow strict */

import * as React from 'react';
import { connect } from 'react-redux';

import Window from './window.jsx';

import type { StoreState, Workspace as WorkspaceType } from 'types';

type StateProps = {|
  +currentWindowId: number,
  +env: Object
|};

type PassedProps = {|
  +workspace: WorkspaceType,
|}

type Props = PassedProps & StateProps;

const Workspace = ({ workspace, currentWindowId, env }: Props) => {
  const padding = env.windowPadding || 10;
  const windows = workspace.windows.map((window, i) => (
    <Window
      key={window.id}
      index={i}
      window={window}
      selected={window.id === currentWindowId}
      workspace={workspace}
    />
  ));

  return <div
    className="workspace"
    style={{
      width: "calc(100% - " + padding + "px)",
      height: "calc(100% - 20px - " + padding + "px)"
    }}
  >{windows}</div>;
};

const mapStateToProps = (state: StoreState): StateProps => ({
  currentWindowId: state.selectedWindow,
  env: state.wsh.env
});

const ConnectedComp: React.ComponentType<PassedProps> = connect(
  mapStateToProps
)(Workspace);

export default ConnectedComp;
