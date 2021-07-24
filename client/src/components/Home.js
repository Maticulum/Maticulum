import React, { Component } from 'react';
import { Container } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';

import Web3Context from '../Web3Context';

import SuperAdminHome from './dashboard/SuperAdminHome';
import SchoolAdminHome from './dashboard/SchoolAdminHome';
import JuryHome from './dashboard/JuryHome';
import StudentHome from './dashboard/StudentHome';


class Home extends Component {

   static contextType = Web3Context;

   state = { isSuperAdmin: false, isSchoolAdmin: false, isJury: false, isStudent: false }

   async componentDidMount() {
      if (this.context.isSuperAdmin) {
         this.setState({ isSuperAdmin: true });
         return;
      }

      const isSchoolAdmin = await this.context.contractSchool.methods.getAdministratorSchoolsCount(this.context.account).call() > 0;
      if (isSchoolAdmin) {
         this.setState({ isSchoolAdmin: true });
         return;
      }

      const isJury = await this.context.contractTraining.methods.isJury(this.context.account).call();
      if (isJury) {
         this.setState({ isJury: true });
         return;
      }

      this.setState({ isStudent: true });
   }


   render() {
      return (
         <Container>
            { this.state.isSuperAdmin && <SuperAdminHome /> }
            { this.state.isSchoolAdmin && <SchoolAdminHome /> }
            { this.state.isJury && <JuryHome /> }
            { this.state.isStudent && <StudentHome /> }
         </Container>
      );
   }
}

export default withRouter(Home);
