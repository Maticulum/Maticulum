import React, { Component } from 'react';
import { Badge, Table } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import Web3Context from '../../Web3Context';


class JuryHome extends Component {

   static contextType = Web3Context;

   state = { trainings: [] }


   async componentDidMount() {
      const trainings = [];
      const cm = this.context.contractTraining.methods;

      // Trainings for this jury
      const trainingIds = await cm.getTrainingsForJury(this.context.account).call();
      for (let i = 0; i < trainingIds.length; i++) {
         const trainingId = trainingIds[i];
         const training = await this.context.contractTraining.methods.trainings(trainingId).call();
         const school = await this.context.contractSchool.methods.schools(training.school).call();

         trainings.push({ id: trainingId, ...training, school: school.name, waiting: false });
      }

      // Trainings waiting validation for this jury
      const trainingsWaitingIds = await cm.getTrainingsWaitingValidationForJury(this.context.account).call();
      for (let i = 0; i < trainingsWaitingIds.length; i++) {
         const trainingId = trainingsWaitingIds[i];
         const training = await this.context.contractTraining.methods.trainings(trainingId).call();
         const school = await this.context.contractSchool.methods.schools(training.school).call();

         trainings.push({ id: trainingId, ...training, school: school.name, waiting: true });
      }

      this.setState({ trainings });
   }


   render() {
      const { t } = this.props;  

      return (
         <>
            { this.state.trainings && 
               <>
               <h3>{t('training.trainingJury')}</h3>
               <Table>
                  <thead>
                     <tr>
                        <th>{t('training.school')}</th>
                        <th>{t('training.training')}</th>
                        <th>{t('training.diplomaWaiting')}</th>
                     </tr>
                  </thead>
                  <tbody>
                     { this.state.trainings.map((training, sindex) => 
                        <tr key={sindex}>
                           <td>{ training.school }</td>
                           <td>
                              { training.name } &nbsp;
                              { training.waiting && <Badge bg="secondary warning" className="bg-secondary bg-warning">{t('training.waitingValidation')}</Badge> }
                           </td>
                           <td>
                              <a href={`/trainings/${training.id}/validation`}>{t('button.validate')}}</a>
                           </td>
                        </tr> 
                     )}
                  </tbody>
               </Table>
               </>
            }
         </>
      );
   }
}

export default withTranslation()(withRouter(JuryHome));
