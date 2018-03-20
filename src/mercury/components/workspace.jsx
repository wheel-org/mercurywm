/* @flow */

import * as React from 'react';
import { connect } from 'react-redux';

import Window from './window.jsx';

import type { StoreState, Workspace as WorkspaceType } from 'types';

type StateProps = {|
  +currentWindowId: number
|};

type Props = {|
  +workspace: WorkspaceType,
  ...StateProps
|};

const Workspace = ({ workspace, currentWindowId }: Props) => {
  const windows = [];
  for (let i = 0; i < workspace.windows.length; i++) {
    windows.push(
      <Window
        key={workspace.windows[i].id}
        index={i}
        window={workspace.windows[i]}
        selected={workspace.windows[i].id === currentWindowId}
      />
    );
  }
  return <div className="workspace">{windows}</div>;
};

const mapStateToProps = (state: StoreState): StateProps => ({
  currentWindowId: state.selectedWindow
});

export default connect(mapStateToProps)(Workspace);
