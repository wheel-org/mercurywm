/* @flow strict */

import * as React from 'react';
import { connect } from 'react-redux';

import Window from './window.jsx';

import type { StoreState, Workspace as WorkspaceType } from 'types';

type StateProps = {|
  +currentWindowId: number
|};

type PassedProps = {|
  +workspace: WorkspaceType,
|}

type Props = PassedProps & StateProps;

const Workspace = ({ workspace, currentWindowId }: Props) => {
  const windows = workspace.windows.map((window, i) => (
    <Window
      key={window.id}
      index={i}
      window={window}
      selected={window.id === currentWindowId}
    />
  ));

  return <div className="workspace">{windows}</div>;
};

const mapStateToProps = (state: StoreState): StateProps => ({
  currentWindowId: state.selectedWindow
});

const ConnectedComp: React.ComponentType<PassedProps> = connect(
  mapStateToProps
)(Workspace);

export default ConnectedComp;
