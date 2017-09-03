import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const BottomBar = ({ numWorkspaces, selectedWorkspace, username, onClick }) => {
    let buttons = [];
    for (let i = 0; i < numWorkspaces; i++) {
        (id =>
            buttons.push(
                <div
                    className={'ws-btn' + (i === selectedWorkspace ? ' selected' : '')}
                    key={id}
                    onClick={() => onClick(id)}
                >
                    {id}
                </div>
            )
        )(i);
    }
    return (
        <div className='bottombar'>
            <div className='ws-btn-list'>
                {buttons}
            </div>
            <div className='logged-in-as'>
                Logged in as {username}
            </div>
        </div>
    );
};

BottomBar.propTypes = {
    numWorkspaces: PropTypes.number.isRequired,
    selectedWorkspace: PropTypes.number.isRequired,
    username: PropTypes.string,
    onClick: PropTypes.func.isRequired
};

const mapStateToProps = state => {
    return {
        numWorkspaces: state.workspaces.length,
        selectedWorkspace: state.selectedWorkspace,
        username: state.wsh.env.username
    }
};

const mapDispatchToProps = dispatch => {
    return {
        onClick: id => {
            dispatch({
                type: 'SELECT_WORKSPACE',
                id
            })
        }
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(BottomBar);
