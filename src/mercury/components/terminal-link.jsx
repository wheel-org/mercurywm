/* @flow */

import * as React from 'react';
import { connect } from 'react-redux';

import Terminal from './terminal.jsx';
import Constants from 'constants.js';
import { getDirectory } from 'utils';
// This is only here because getDirectory needs the file system is a parameter
// For other state needs, use connect!
import store from 'mercury/store';

import type {
  StoreState,
  Dispatch,
  Terminal as TerminalType,
  Directory
} from 'types';

type StateProps = {|
  +selectedWorkspace: number,
  +workspaceCount: number,
  +prompt: string,
  +username: string,
  +wfs: Directory
|};

type DispatchProps = {|
  +updateCommand: (string, number) => void,
  +addCommand: (string, boolean) => void,
  +executeCommand: string => void
|};

type Props = {|
  terminal: TerminalType,
  selected: boolean,
  ...StateProps,
  ...DispatchProps
|};

type State = {|
  historyIndex: number,
  cursor: number,
  tabPressed: boolean
|};

class TerminalLink extends React.Component<Props, State> {
  input: ?HTMLDivElement;
  animation: ?IntervalID;
  state = {
    historyIndex: this.props.terminal.history.length - 1,
    cursor: this.props.terminal.history[this.props.terminal.history.length - 1]
      .length,
    tabPressed: false
  };

  componentDidMount() {
    if (!this.input) return;

    if (this.props.selected) {
      this.input.focus();
    }
    this.input.scrollTop = this.input.scrollHeight;

    // TODO: event is a ClipboardEvent, which isn't supported in flow right now
    this.input.addEventListener('paste', (event: any) => {
      const clipboardData = (event.clipboardData: DataTransfer).getData(
        'text/plain'
      );
      const command = this.getCurrentInputCommand();
      this.props.updateCommand(
        command.slice(0, this.state.cursor) +
          clipboardData +
          command.slice(this.state.cursor),
        this.state.historyIndex
      );
      this.setState({
        cursor: this.state.cursor + clipboardData.length
      });
    });
  }

  componentDidUpdate() {
    if (this.props.selected) {
      if (this.input) this.input.focus();
      this.startSmoothScroll(100, function(x) {
        // return (1 - Math.cos(Math.PI * x)) / 2;
        // return Math.cbrt(x - 0.5) / 1.585 + 0.5;
        return 3 * x * x - 2 * x * x * x;
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.historyIndex < 0) {
      this.setState({ historyIndex: 0 });
    } else if (this.state.historyIndex >= nextProps.terminal.history.length) {
      this.setState({ historyIndex: nextProps.terminal.history.length - 1 });
    }
  }

  startSmoothScroll(time, interpolator) {
    if (this.animation) {
      clearInterval(this.animation);
    }

    if (!this.input) {
      return;
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
      if (animationProgress > time) {
        if (this.animation) clearInterval(this.animation);
        if (this.input) this.input.scrollTop = animationEnd;
      }

      const timeStep = animationProgress / time;
      const newTop =
        animationStart +
        interpolator(timeStep) * (animationEnd - animationStart);
      if (this.input) {
        this.input.scrollTop = newTop;
      }
    }, 16);
  }

  getCurrentInputCommand() {
    const history = this.props.terminal.history;
    return history[this.state.historyIndex];
  }

  handleKey = (e: SyntheticKeyboardEvent<HTMLDivElement>) => {
    const history = this.props.terminal.history;
    const command = this.getCurrentInputCommand();

    if (!this.props.selected || this.props.terminal.running) {
      return;
    }

    if (this.input) {
      this.input.scrollTop = this.input.scrollHeight;
    }

    if (e.keyCode === Constants.KEY_ENTER && command.length > 0) {
      this.props.executeCommand(command);
      this.setState({
        cursor: 0,
        historyIndex: history.length
      });
    } else if (e.keyCode === Constants.KEY_UP_ARROW) {
      if (this.state.historyIndex > 0) {
        this.setState({
          cursor: history[this.state.historyIndex - 1].length,
          historyIndex: this.state.historyIndex - 1
        });
      }
      e.preventDefault();
    } else if (
      e.keyCode === Constants.KEY_DOWN_ARROW &&
      this.state.historyIndex < history.length - 1
    ) {
      this.setState({
        cursor: history[this.state.historyIndex + 1].length,
        historyIndex: this.state.historyIndex + 1
      });
      e.preventDefault();
    } else if (
      e.keyCode === Constants.KEY_LEFT_ARROW &&
      this.state.cursor > 0
    ) {
      this.setState({
        cursor: this.state.cursor - 1
      });
    } else if (
      e.keyCode === Constants.KEY_RIGHT_ARROW &&
      this.state.cursor < command.length
    ) {
      this.setState({
        cursor: this.state.cursor + 1
      });
    } else if (e.keyCode === Constants.KEY_BACKSPACE && this.state.cursor > 0) {
      this.props.updateCommand(
        command.slice(0, this.state.cursor - 1) +
          command.slice(this.state.cursor),
        this.state.historyIndex
      );
      this.setState({
        cursor: this.state.cursor - 1
      });
    } else if (
      e.keyCode === Constants.KEY_DELETE &&
      this.state.cursor < command.length
    ) {
      this.props.updateCommand(
        command.slice(0, this.state.cursor) +
          command.slice(this.state.cursor + 1),
        this.state.historyIndex
      );
    } else if (e.keyCode === Constants.KEY_TAB) {
      const words = command.split(' ');
      if (words.length > 1) {
        const lastWord = words[words.length - 1];
        // Grab Matches
        const workingDirectory = getDirectory(
          this.props.terminal.workingDirectory,
          store.getState().wfs
        );
        // Guaranteed to exist since we're in the directory
        if (!workingDirectory) return;

        const matches = workingDirectory.data.filter(data =>
          data.name.match('^' + lastWord)
        );

        if (matches.length === 1) {
          // Can autofill
          this.setState({
            tabPressed: false
          });
          const name =
            matches[0].name.indexOf(' ') >= 0
              ? '"' + matches[0].name + '"'
              : matches[0].name;
          const newCommand =
            command.slice(0, command.lastIndexOf(' ')) + ' ' + name;
          this.props.updateCommand(newCommand, this.state.historyIndex);
          this.setState({
            cursor: newCommand.length
          });
        } else if (this.state.tabPressed) {
          this.setState({
            tabPressed: false
          });
          this.props.addCommand(command, true);
          for (let i = 0; i < matches.length; i++) {
            this.props.addCommand(
              (workingDirectory.data[i].type === Constants.DIR_TYPE
                ? 'DIR     '
                : 'FILE    ') + workingDirectory.data[i].name,
              false
            );
          }
        } else {
          this.setState({
            tabPressed: true
          });
        }

        e.preventDefault();
      }
    } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
      this.props.updateCommand(
        command.slice(0, this.state.cursor) +
          e.key +
          command.slice(this.state.cursor),
        this.state.historyIndex
      );
      this.setState({
        cursor: this.state.cursor + 1
      });
    }
  };

  render() {
    const prompt = this.props.prompt
      .replace('%w', this.props.terminal.workingDirectory)
      .replace('%u', this.props.username);
    let command = this.props.terminal.history[this.state.historyIndex];
    if (command === undefined) {
      command = this.props.terminal.history[0];
    }

    return (
      <div
        className="terminal-link"
        ref={input => (this.input = input)}
        tabIndex="1"
        onKeyDown={this.handleKey}
      >
        <Terminal
          output={this.props.terminal.output}
          command={command}
          cursor={this.state.cursor}
          prompt={prompt}
          selected={this.props.selected}
          running={this.props.terminal.running}
        />
      </div>
    );
  }
}

const mapStateToProps = (state: StoreState): StateProps => ({
  selectedWorkspace: state.selectedWorkspace,
  workspaceCount: state.workspaces.length,
  prompt: state.wsh.env.prompt,
  username: state.wsh.env.username,
  wfs: state.wfs
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => {
  return {
    updateCommand: (text: string, index: number) => {
      dispatch({
        type: 'UPDATE_COMMAND',
        text,
        index
      });
    },
    addCommand: (text: string, showPrompt: boolean) => {
      dispatch({
        type: 'ADD_COMMAND',
        text,
        showPrompt
      });
    },
    executeCommand: (text: string) => {
      dispatch({
        type: 'EXECUTE_COMMAND',
        text
      });
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TerminalLink);
