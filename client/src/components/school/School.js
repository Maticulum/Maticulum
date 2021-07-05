import React, { Component } from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';

import Web3Context from "../../Web3Context";

import SchoolList from './SchoolList';
import SchoolItem from './SchoolItem';


class School extends Component {

  static contextType = Web3Context;

  render() {
    const path = this.props.match.path;

    return (
      <Switch>
          <Route exact path={`${path}`}>
            <SchoolList />
          </Route>
          <Route path={`${path}/:schoolId`}>
            <SchoolItem />
          </Route>
      </Switch>
    );
  }
}

export default withRouter(School);
