/* @flow strict */

import * as React from 'react';

type Props = {|
  +children: React.Node,
  +selected: boolean,
  +handleKey: (e: SyntheticKeyboardEvent<HTMLDivElement>) => void,
  +onPaste: (data: string) => void
|};

class SmoothScroll extends React.Component<Props> {
  animation: ?AnimationFrameID;
  input = React.createRef<HTMLDivElement>();

  componentDidMount() {
    const box = this.input.current;
    if (!box) return;

    if (this.props.selected) {
      box.focus();
    }

    box.scrollTop = box.scrollHeight;

    box.addEventListener('paste', (event: ClipboardEvent) => {
      const clipboardData = event.clipboardData;
      if (!clipboardData) return;

      const data = clipboardData.getData('text/plain');
      this.props.onPaste(data);
    });
  }

  componentDidUpdate() {
    if (this.props.selected) {
      const box = this.input.current;
      if (box) box.focus();

      this.startSmoothScroll(100, x => 3 * x * x - 2 * x * x * x);
    }
  }

  handleKey = (e: SyntheticKeyboardEvent<HTMLDivElement>) => {
    if (!this.props.selected) return;

    if (this.input && this.input.current) {
      this.input.current.scrollTop = this.input.current.scrollHeight;
    }

    this.props.handleKey(e);
  };

  startSmoothScroll(duration: number, interpolator: number => number) {
    // Cancel any ongoing scrolling
    if (this.animation) {
      cancelAnimationFrame(this.animation);
      this.animation = null;
    }

    const box = this.input.current;
    if (!box) {
      return;
    }

    // Start and end points
    const animationStart = box.scrollTop;
    const animationEnd = box.scrollHeight - box.offsetHeight;

    // Finish scrolling
    if (animationStart >= animationEnd) {
      box.scrollTop = animationEnd;
      return;
    }

    const startTime = performance.now();

    const animate = (currTime: DOMHighResTimeStamp) => {
      const deltaTime = currTime - startTime;
      // Duration over, finish scrolling
      if (deltaTime > duration) {
        if (this.animation) {
          cancelAnimationFrame(this.animation);
          this.animation = null;
        }
        if (box) box.scrollTop = animationEnd;
        return;
      }

      // Continue scrolling
      const timeStep = deltaTime / duration;
      const newTop = animationStart + interpolator(timeStep) * (animationEnd - animationStart);
      if (box) box.scrollTop = newTop;

      this.animation = requestAnimationFrame(animate);
    };

    // Start animating
    this.animation = requestAnimationFrame(animate);
  }

  render(): React.Node {
    return (
      <div
        className="terminal-link"
        ref={this.input}
        onKeyDown={this.handleKey}
        /* tabIndex is needed for onKeyDown to work on a div:
         * https://stackoverflow.com/questions/43503964/onkeydown-event-not-working-on-divs-in-react */
        tabIndex="1"
      >
        {this.props.children}
      </div>
    );
  }
}

export default SmoothScroll;
