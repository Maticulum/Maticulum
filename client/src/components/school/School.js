import React, { Component } from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';

import Web3Context from "../../Web3Context";

import SchoolList from './SchoolList';
import SchoolItem from './SchoolItem';


class School extends Component {

  static contextType = Web3Context;

  render() {
    console.log('ACCOUNT = ', this.context.account);
    console.log(this.props.match);
    const path = this.props.match.path;

    return (
      
        <div>
            SCHOOL
          <Switch>
              <Route exact path={path}>
                <SchoolList />
              </Route>
              <Route path={`${path}/:schoolId`}>
                <SchoolItem />
              </Route>
          </Switch>
        </div>
    );
  }
}

export default withRouter(School);
