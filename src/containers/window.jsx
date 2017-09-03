import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import TerminalLink from './terminal-link.jsx';
import Constants from '../constants';

class Window extends React.Component {
    constructor(props) {
        super(props);
        this.cacheParamValue = Date.now();
    }

    render() {
        const { window, index, selected, onClick, env } = this.props;

        return (
            <div className='window-box' onClick={() => onClick(window.id)} style={{
                width: window.width + '%',
                height: window.height + '%',
                left: window.x + '%',
                top: window.y + '%'
            }}>

            {window.terminal.inProg ?
                <iframe
                    className='window-frame'
                    src={Constants.MERCURYWM_CONTENT_URL + window.terminal.runningCommand + '/index.html' +
                        '?workingDirectory=' + window.terminal.workingDirectory +
                        '&cache=' + this.cacheParamValue +
                        '&id=' + window.id +
                        '&env=' + encodeURIComponent(JSON.stringify(env)) +
                        '&params=' + encodeURIComponent(JSON.stringify(window.terminal.params))}
                ></iframe>
            :
                <span>
                    <div className={'window' + (selected ? ' selected' : ' ')}>
                        <TerminalLink terminal={window.terminal} selected={selected}/>
                    </div>
                    <div className='window-info'>
                        <span>{index} ({window.id})</span>
                        <span style={{ float: 'right' }}>
                            {window.x}, {window.y}, {window.width}, {window.height}
                        </span>
                    </div>
                </span>}
            </div>
        );
    }
};

Window.propTypes = {
    window: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    selected: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired
};

const mapStateToProps = state => {
    return {
        env: state.wsh.env
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onClick: id => {
            dispatch({
                type: 'SELECT_WINDOW',
                id
            })
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Window);
