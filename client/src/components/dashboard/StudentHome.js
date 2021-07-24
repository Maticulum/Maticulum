import React, { Component } from 'react';
import { Badge, Button, Container, Table } from 'react-bootstrap';
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
      const trainingCount = await cm.getUserTrainingsCount(this.context.account).call();
      for (let i = 0; i < trainingCount; i++) {
         const trainingId = await cm.getUserTraining(this.context.account, i).call();
         const training = await cm.trainings(trainingId).call();
         const school = await cmSchool.schools(training.school).call();
         trainings.push({ id: trainingId, school: school.name, name: training.name, waiting: false });
      }

      // get trainings waiting for validation
      const waitingCount = await cm.getTrainingsUserWaitingValidationCount(this.context.account).call();
      for (let i = 0; i < waitingCount; i++) {
         const trainingId = await cm.getTrainingUserWaitingValidation(this.context.account, i).call();
         const training = await cm.trainings(trainingId).call();
         const school = await cmSchool.schools(training.school).call();
         trainings.push({ id: trainingId, school: school.name, name: training.name, waiting: true });
      }

      console.log("Trainings", trainings);
      this.setState({ trainings });
   }


   render() {
      const { t } = this.props;  

      return (
         <Container>
            <Table>
               <thead>
                  <tr>
                     <th>Training</th>
                     <th>Status</th>
                  </tr>
               </thead>
               <tbody>
                  { this.state.trainings.map((training, sindex) => 
                     <tr key={sindex}>
                        <td>{training.school} - { training.name }</td>
                        <td>
                           Registered
                           { training.waiting && ' (Waiting validation)' }
                        </td>
                     </tr> 
                  )}
               </tbody>
            </Table>

            <Button onClick={e => this.props.history.push('/trainings/choice') }>Register to a new training</Button>
         </Container>
      );
   }
}

export default withTranslation()(withRouter(StudentHome));
