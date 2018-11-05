/* @flow strict */

import * as React from 'react';
import { connect } from 'react-redux';

import type { StoreState, Dispatch } from 'types';

type StateProps = {|
  +numWorkspaces: number,
  +selectedWorkspace: number,
  +username: string
|};

type DispatchProps = {|
  +onClick: number => void
|};

type Props = StateProps & DispatchProps;

const BottomBar = ({
  numWorkspaces,
  selectedWorkspace,
  username,
  onClick
}: Props): React.Node => {
  const buttons = [];
  for (let i = 0; i < numWorkspaces; i++) {
    buttons.push(
      <div
        className={'ws-btn' + (i === selectedWorkspace ? ' selected' : '')}
        key={i}
        onClick={() => onClick(i)}
      >
        {i}
      </div>
    );
  }

  return (
    <div className="bottombar">
      <div className="ws-btn-list">{buttons}</div>
      <div className="logged-in-as">Logged in as {username}</div>
    </div>
  );
};

const mapStateToProps = (state: StoreState): StateProps => ({
  numWorkspaces: state.workspaces.length,
  selectedWorkspace: state.selectedWorkspace,
  username: state.wsh.env.username
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
  onClick: (id: number) => {
    dispatch({
      type: 'SELECT_WORKSPACE',
      id
    });
  }
});

const ConnectedComp: React.ComponentType<{||}> = connect(
  mapStateToProps,
  mapDispatchToProps
)(BottomBar);

export default ConnectedComp;
