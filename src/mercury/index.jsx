/* @flow strict */

import * as React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import Root from 'mercury/components/root.jsx';
import store from 'mercury/store';

const root = document.getElementById('root');
if (root) {
  render(
    <Provider store={store}>
      <Root />
    </Provider>,
    root
  );
}

window.getState = () => store.getState();
window.reset = () => store.dispatch({ type: 'RESET_STORE' });
