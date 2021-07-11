import React, { Component } from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';

import Web3Context from "../../Web3Context";

import SchoolList from './SchoolList';
import SchoolItem from './SchoolItem';
import TrainingItem from '../Training';


class School extends Component {

   static contextType = Web3Context;

   render() {
      const path = this.props.match.path;

      return (
         <Switch>
            <Route exact path={`${path}`} component={ SchoolList} />
            <Route path={`${path}/:schoolId/trainings/:trainingId`} component={ TrainingItem } />
            <Route path={`${path}/:schoolId`} component={ SchoolItem } />
         </Switch>
      );
  }
}

export default withRouter(School);
