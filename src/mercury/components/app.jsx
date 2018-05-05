/* @flow */

import * as React from 'react';
import { connect } from 'react-redux';
import Workspace from './workspace.jsx';
import BottomBar from './bottombar.jsx';

import type { StoreState, Dispatch, Workspace as WorkspaceType } from 'types';

type Props = {|
    +currentWorkspace: WorkspaceType,
    +background: string,
    +title: string
|};

const App = (props: Props) => {
    document.title = props.title;

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                background: props.background
            }}
        >
            <Workspace workspace={props.currentWorkspace} />
            <BottomBar />
        </div>
    );
};

const mapStateToProps = (state: StoreState): Props => {
    let bg = state.wsh.env.background;
    if (bg.startsWith('http://') || bg.startsWith('https://')) {
        bg = 'url("' + bg + '") 0% 0% / cover';
    }

    return {
        currentWorkspace: state.workspaces[state.selectedWorkspace],
        background: bg,
        title: state.wsh.env.title || Constants.NAME + ' ' + Constants.VERSION
    };
};

export default connect(mapStateToProps)(App);
