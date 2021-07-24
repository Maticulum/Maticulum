import React, { Component } from 'react';
import { Badge, Button, Container, Table } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import Web3Context from '../../Web3Context';


class JuryHome extends Component {

   static contextType = Web3Context;

   state = { trainings: [] }

   async componentDidMount() {
      const juryTrainings = [];
      const cm = this.context.contractTraining.methods;

      // Trainings for this jury
      const nbTrainings = await cm.getTrainingsCountForJury(this.context.account).call();
      console.log('nbTrainings', nbTrainings);
      for (let i = 0; i < nbTrainings; i++) {
         const trainingId = await cm.getTrainingForJury(this.context.account, i).call();
         const training = await cm.trainings(trainingId).call();

         juryTrainings.push({ id: trainingId, ...training, waiting: false });
      }

      // Trainings waiting validation for this jury
      const trainingsWaitingCount = await cm.getTrainingsWaitingValidationCountForJury(this.context.account).call();
      console.log('trainingsWaitingCount', trainingsWaitingCount);
      for (let i = 0; i < trainingsWaitingCount; i++) {
         const trainingId = await cm.getTrainingWaitingValidationForJury(this.context.account, i).call();
         const training = await cm.trainings(trainingId).call();

         juryTrainings.push({ id: trainingId, ...training, waiting: true });
      }

      // TODO students waiting validation
      // TODO diploma waiting validation

      this.setState({ juryTrainings });
   }


   render() {
      const { t } = this.props;  

      return (
         <Container>
            { this.state.juryTrainings && 
               <>
               <h3>Jury pour les formations</h3>
               <ul>
               { this.state.juryTrainings.map((training, index) => 
                  <li key={index}>
                     <a href={`/trainings/${training.id}/validation`}>{ training.name }</a>
                     { training.waiting && ' (Waiting validation)' }
                  </li>
               )}
               </ul>
               </>
            }
         </Container>
      );
   }
}

export default withTranslation()(withRouter(JuryHome));
