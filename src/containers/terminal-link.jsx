import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Terminal from './terminal.jsx';
import Constants from '../constants.js';
import { getDirectory } from '../utils';

class TerminalLink extends React.Component {
    constructor(props) {
        super(props);
        this.handleKey = this.handleKey.bind(this);
        this.state = {
            historyIndex: this.props.terminal.history.length - 1,
            cursor: this.props.terminal.history[this.props.terminal.history.length - 1].length,
            tabPressed: false
        };
    }

    componentDidMount() {
        if (this.props.selected) {
            this.input.focus();
        }
        this.input.scrollTop = this.input.scrollHeight;

        this.input.addEventListener('paste', event => {
            const clipboardData = event.clipboardData.getData("text/plain");
            const command = this.getCurrentInputCommand();
            this.props.updateCommand(
                command.slice(0, this.state.cursor) + clipboardData + command.slice(this.state.cursor),
                this.state.historyIndex
            );
            this.setState({
                cursor: this.state.cursor + clipboardData.length
            });
        });
    }

    componentDidUpdate() {
        if (this.props.selected) {
            this.input.focus();
            this.startSmoothScroll(500, function(x) {
                // return (1 - Math.cos(Math.PI * x)) / 2;
                // return Math.cbrt(x - 0.5) / 1.585 + 0.5;
                return 3*x*x - 2*x*x*x;
            });
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.state.historyIndex < 0) {
            this.setState({ historyIndex: 0 });
        }
        else if (this.state.historyIndex >= nextProps.terminal.history.length) {
            this.setState({ historyIndex: nextProps.terminal.history.length - 1 });
        }
    }

    startSmoothScroll(time, interpolator) {
        if (this.animation) {
            clearInterval(this.animation);
        }

        const animationStart = this.input.scrollTop;
        const animationEnd = this.input.scrollHeight - this.input.offsetHeight;
        let animationProgress = 0;

        if (animationStart >= animationEnd) {
            this.input.scrollTop = animationEnd;
            return;
        }

        this.animation = setInterval(() => {
            animationProgress += 16;
            const timeStep = animationProgress / time;
            this.input.scrollTop = animationStart +
                interpolator(timeStep) * (animationEnd - animationStart);
            if (animationProgress > time) {
                clearInterval(this.animation);
                this.input.scrollTop = animationEnd;
            }
        }, 16);
    }

    getCurrentInputCommand() {
        const history = this.props.terminal.history;
        return history[this.state.historyIndex];
    }

    handleKey(e) {
        const history = this.props.terminal.history;
        const command = this.getCurrentInputCommand();

        if (!this.props.selected || this.props.terminal.inProg) {
            return;
        }

        this.input.scrollTop = this.input.scrollHeight;

        if (e.keyCode === Constants.KEY_ENTER) {
            this.props.executeCommand(command);
            this.setState({
                cursor: 0,
                historyIndex: history.length
            });
        }
        else if ((e.keyCode === Constants.KEY_LEFT_ARROW || e.keyCode === Constants.KEY_RIGHT_ARROW) && e.altKey) {
            this.props.workspaceKeyDispatch(e.keyCode);
            e.preventDefault();
        }
        else if ([Constants.KEY_LEFT_ARROW, Constants.KEY_RIGHT_ARROW,
                  Constants.KEY_UP_ARROW, Constants.KEY_DOWN_ARROW].indexOf(e.keyCode) > -1
                  && e.shiftKey) {
            this.props.windowKeyDispatch(e.keyCode);
            e.preventDefault();
        }
        else if (e.keyCode === Constants.KEY_UP_ARROW) {
            if (this.state.historyIndex > 0) {
                this.setState({
                    cursor: history[this.state.historyIndex - 1].length,
                    historyIndex: this.state.historyIndex - 1
                });
            }
            e.preventDefault();
        }
        else if (e.keyCode === Constants.KEY_DOWN_ARROW && this.state.historyIndex < history.length - 1) {
            this.setState({
                cursor: history[this.state.historyIndex + 1].length,
                historyIndex: this.state.historyIndex + 1
            });
            e.preventDefault();
        }
        else if (e.keyCode === Constants.KEY_LEFT_ARROW && this.state.cursor > 0) {
            this.setState({
                cursor: this.state.cursor - 1
            });
        }
        else if (e.keyCode === Constants.KEY_RIGHT_ARROW && this.state.cursor < command.length) {
            this.setState({
                cursor: this.state.cursor + 1
            });
        }
        else if (e.keyCode === Constants.KEY_BACKSPACE && this.state.cursor > 0) {
            this.props.updateCommand(
                command.slice(0, this.state.cursor - 1) + command.slice(this.state.cursor),
                this.state.historyIndex
            );
            this.setState({
                cursor: this.state.cursor - 1
            });
        }
        else if (e.keyCode === Constants.KEY_TAB) {
            const words = command.split(' ');
            if (words.length > 1) {
                const lastWord = words[words.length - 1];
                // Grab Matches
                const workingDirectory = getDirectory(this.props.terminal.workingDirectory, this.props.wfs)[0];
                const matches = workingDirectory.data.filter(data => data.name.match('^' + lastWord));
                if (matches.length === 1) {
                    // Can autofill
                    this.setState({
                        tabPressed: false
                    });
                    const name = matches[0].name.indexOf(' ') >= 0 ?
                        '"' + matches[0].name + '"' :
                        matches[0].name;
                    const newCommand = command.slice(0, command.lastIndexOf(' ')) + ' ' + name;
                    this.props.updateCommand(
                        newCommand,
                        this.state.historyIndex
                    );
                    this.setState({
                        cursor: newCommand.length
                    });
                }
                else {
                    if (this.state.tabPressed) {
                        this.setState({
                            tabPressed: false
                        });
                        this.props.addCommand(command, true);
                        for (let i = 0; i < matches.length; i++) {
                            this.props.addCommand(
                                (workingDirectory.data[i].type === Constants.DIR_TYPE ?
                                    'DIR     ' :
                                    'FILE    ') + workingDirectory.data[i].name, false);
                        }
                    }
                    else {
                        this.setState({
                            tabPressed: true
                        });
                    }
                }
            }
            e.preventDefault();
        }
        else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
            this.props.updateCommand(
                command.slice(0, this.state.cursor) + e.key + command.slice(this.state.cursor),
                this.state.historyIndex
            );
            this.setState({
                cursor: this.state.cursor + 1
            });
        }
    }

    render() {
        const prompt = this.props.prompt.replace('%w', this.props.terminal.workingDirectory)
                                        .replace('%u', this.props.username);
        let command = this.props.terminal.history[this.state.historyIndex];
        if (command === undefined) {
            command = this.props.terminal.history[0];
        }

        return (
            <div
                className='terminal-link'
                ref={input => this.input = input}
                tabIndex='1'
                onKeyDown={this.handleKey}
            >
                <Terminal
                    output={this.props.terminal.output}
                    command={command}
                    cursor={this.state.cursor}
                    prompt={prompt}
                    selected={this.props.selected}
                />
            </div>
        );
    }
};

TerminalLink.propTypes = {
    terminal: PropTypes.object.isRequired,
    selected: PropTypes.bool.isRequired,
    prompt: PropTypes.string.isRequired,
    wfs: PropTypes.object.isRequired,
    // Action Dispatch
    updateCommand: PropTypes.func.isRequired,
    addCommand: PropTypes.func.isRequired,
    executeCommand: PropTypes.func.isRequired,
    workspaceKeyDispatch: PropTypes.func.isRequired,
    windowKeyDispatch: PropTypes.func.isRequired
};

const mapStateToProps = state => {
    return {
        selectedWorkspace: state.selectedWorkspace,
        workspaceCount: state.workspaces.length,
        prompt: state.wsh.env.prompt,
        username: state.wsh.env.username,
        wfs: state.wfs
    }
}

const mapDispatchToProps = dispatch => {
    return {
        updateCommand: (text, index) => {
            dispatch({
                type: 'UPDATE_COMMAND',
                text,
                index
            })
        },
        addCommand: (text, showPrompt) => {
            dispatch({
                type: 'ADD_COMMAND',
                text,
                showPrompt
            })
        },
        executeCommand: text => {
            dispatch({
                type: 'EXECUTE_COMMAND',
                text
            })
        },
        workspaceKeyDispatch: direction => {
            dispatch({
                type: 'INTENT_SELECT_WORKSPACE',
                direction
            })
        },
        windowKeyDispatch: direction => {
            dispatch({
                type: 'INTENT_SELECT_WINDOW',
                direction
            })
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TerminalLink);
