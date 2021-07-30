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
      const user = await this.context.contract.methods.users(this.context.account).call();
      const isSuperAdmin = (user.role & 0x80) === 0x80;
      const schools = await this.context.contractSchool.methods.getAdministratorSchools(this.context.account).call();
      const isSchoolAdmin = schools.length > 0;
      const isJury = await this.context.contractTraining.methods.isJury(this.context.account).call();
      const isStudent = !(isSuperAdmin || isSchoolAdmin || isJury);

      this.setState({ isSuperAdmin, isSchoolAdmin, isJury, isStudent });
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
