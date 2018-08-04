/* @flow */

import * as React from 'react';
import { connect } from 'react-redux';
import Workspace from './workspace.jsx';
import BottomBar from './bottombar.jsx';

import type { StoreState, Dispatch, Workspace as WorkspaceType } from 'types';

type Props = {|
    +currentWorkspace: WorkspaceType,
    +background: string,
    +font: string,
    +title: string
|};

const App = (props: Props) => {
    document.title = props.title;
    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                background: props.background,
                fontFamily: props.font
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

    let font = state.wsh.env.font;
    if (!font) {
        font = "'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace";
    }
    return {
        currentWorkspace: state.workspaces[state.selectedWorkspace],
        background: bg,
        font: font,
        title: state.wsh.env.title || Constants.NAME + ' ' + Constants.VERSION
    };
};

export default connect(mapStateToProps)(App);
