/* @flow strict */

import * as React from 'react';
import { connect } from 'react-redux';

import SmoothScroll from './scroll.jsx';
import Terminal from './terminal.jsx';
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

type PassedProps = {|
  +terminal: TerminalType,
  +selected: boolean
|};

type Props = PassedProps & StateProps & DispatchProps;

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

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.state.historyIndex < 0) {
      this.setState({ historyIndex: 0 });
    } else if (this.state.historyIndex >= nextProps.terminal.history.length) {
      this.setState({ historyIndex: nextProps.terminal.history.length - 1 });
    }
  }

  onPaste = (data: string) => {
    const command = this.getCurrentInputCommand();
    this.props.updateCommand(
      command.slice(0, this.state.cursor) +
        data +
        command.slice(this.state.cursor),
      this.state.historyIndex
    );
    this.setState({
      cursor: this.state.cursor + data.length
    });
  };

  getCurrentInputCommand() {
    const history = this.props.terminal.history;
    return history[this.state.historyIndex];
  };

  handleKey = (e: SyntheticKeyboardEvent<HTMLDivElement>) => {
    const history = this.props.terminal.history;
    const command = this.getCurrentInputCommand();

    if (this.props.terminal.running) {
      return;
    }

    if (e.keyCode === Constants.KEY_ENTER) {
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
    if (command == null) {
      command = this.props.terminal.history[0];
    }

    return (
      <SmoothScroll
        selected={this.props.selected}
        handleKey={this.handleKey}
        onPaste={this.onPaste}
      >
        <Terminal
          output={this.props.terminal.output}
          command={command}
          cursor={this.state.cursor}
          prompt={prompt}
          selected={this.props.selected}
          running={this.props.terminal.running}
        />
      </SmoothScroll>
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

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
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
});

const ConnectedComp: React.ComponentType<PassedProps> = connect(
  mapStateToProps,
  mapDispatchToProps
)(TerminalLink);

export default ConnectedComp;
