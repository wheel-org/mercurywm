/* @flow */

import * as React from 'react';

type Props = {|
  +output: Array<{
    +prompt: string,
    +text: string
  }>,
  +command: string,
  +cursor: number,
  +prompt: string,
  +selected: boolean
|};

const Terminal = ({ output, command, cursor, prompt, selected }: Props) => {
  const leftText = command.slice(0, cursor);
  const cursorText = command.slice(cursor, cursor + 1) || ' ';
  const rightText = command.slice(cursor + 1);

  let formatOutput = [];
  for (let i = 0; i < output.length; i++) {
    formatOutput.push(
      <p key={i + '_' + output[i].text}>
        <span className="prompt">{'' + output[i].prompt}</span>
        {output[i].text}
      </p>
    );
  }

  return (
    <div className="terminal">
      <div className="terminal-text">
        {formatOutput}
        <p>
          <span className="prompt">{prompt}</span>
          <span className="before">{leftText}</span>
          <span className={'cursor' + (selected ? ' blink' : '')}>
            {cursorText}
          </span>
          <span className="after">{rightText}</span>
        </p>
      </div>
    </div>
  );
};

export default Terminal;
