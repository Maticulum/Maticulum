import React, { Component } from 'react';
import { Container, Table } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import Web3Context from '../../Web3Context';


class StudentHome extends Component {

   static contextType = Web3Context;

   state = { trainings: [] }

   async componentDidMount() {
      const trainings = [];
      const cm = this.context.contractTraining.methods;
      const cmSchool = this.context.contractSchool.methods;

      // get trainings
      const trainingIds = await cm.getUserTrainings(this.context.account).call();
      for (let i = 0; i < trainingIds.length; i++) {
         const trainingId = trainingIds[i];
         const training = await cm.trainings(trainingId).call();
         const school = await cmSchool.schools(training.school).call();
         trainings.push({ id: trainingId, school: school.name, name: training.name });
      }

      this.setState({ trainings });
   }


   render() {
      const { t } = this.props;  

      return (
         <Container>
            <Table>
               <thead>
                  <tr>
                     <th>{ t('student.training') }</th>
                  </tr>
               </thead>
               <tbody>
                  { this.state.trainings.map((training, sindex) => 
                     <tr key={sindex}>
                        <td>{training.school} - { training.name }</td>
                     </tr> 
                  )}
               </tbody>
            </Table>
         </Container>
      );
   }
}

export default withTranslation()(withRouter(StudentHome));
