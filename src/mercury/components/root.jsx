/* @flow
 * root.jsx
 * Renders the app when data is loaded, or shows the loading page
 * Handles global key listeners and iframe message listeners
 * Shouldn't access the store as it might be loading,
 * but everything else (<App/> onwards) is guaranteed to be loaded
 */

import * as React from 'react';
import { connect } from 'react-redux';

import App from './app.jsx';
import Loading from './loading.jsx';
import Constants from 'constants';

import type { StoreState, Dispatch } from 'types';

type StateProps = {|
  +loaded: boolean
|};

type Props = {| ...StateProps |};

class Root extends React.Component<Props> {
  render() {
    return this.props.loaded ? <App /> : <Loading />;
  }
}

const mapStateToProps = (state: StoreState): StateProps => ({
  loaded: state.loaded
});

module.exports = connect(mapStateToProps)(Root);
