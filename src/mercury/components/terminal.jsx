/* @flow strict */

import * as React from 'react';

type Props = {|
  +output: Array<{|
    +prompt: string,
    +text: string
  |}>,
  +command: string,
  +cursor: number,
  +prompt: string,
  +selected: boolean,
  +running: boolean
|};

const Terminal = ({
  output,
  command,
  cursor,
  prompt,
  selected,
  running
}: Props) => {
  const leftText = command.slice(0, cursor);
  const cursorText = command.slice(cursor, cursor + 1) || ' ';
  const rightText = command.slice(cursor + 1);

  const formatOutput = output.map((line, i) => (
    <p key={i + '_' + line.text}>
      <span className="prompt">{'' + line.prompt}</span>
      {line.text}
    </p>
  ));

  return (
    <div className="terminal">
      <div className="terminal-text">
        {formatOutput}
        {running ? null : (
          <p>
            <span className="prompt">{prompt}</span>
            <span className="before">{leftText}</span>
            <span className={'cursor' + (selected ? ' blink' : '')}>
              {cursorText}
            </span>
            <span className="after">{rightText}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default Terminal;
