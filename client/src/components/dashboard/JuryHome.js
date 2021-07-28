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
      const nbTrainings = await cm.getTrainingsCountForJury(this.context.account).call();
      for (let i = 0; i < nbTrainings; i++) {
         const trainingId = await cm.getTrainingForJury(this.context.account, i).call()
         const training = await this.context.contractTraining.methods.trainings(trainingId).call();
         const school = await this.context.contractSchool.methods.schools(training.school).call();
         const count = await this.context.contractTraining.methods.getUserWaitingTrainingValidationCount(trainingId).call();

         trainings.push({ id: trainingId, ...training, school: school.name, count, waiting: false });
      }

      // Trainings waiting validation for this jury
      const trainingsWaitingCount = await cm.getTrainingsWaitingValidationCountForJury(this.context.account).call();
      for (let i = 0; i < trainingsWaitingCount; i++) {
         const trainingId = await cm.getTrainingWaitingValidationForJury(this.context.account, i).call()
         const training = await this.context.contractTraining.methods.trainings(trainingId).call();
         const school = await this.context.contractSchool.methods.schools(training.school).call();
         const count = await this.context.contractTraining.methods.getUserWaitingTrainingValidationCount(trainingId).call();

         trainings.push({ id: trainingId, ...training, school: school.name, count, waiting: true });
      }

      this.setState({ trainings });
   }


   render() {
      //const { t } = this.props;  

      return (
         <>
            { this.state.trainings && 
               <>
               <h3>Jury pour les formations</h3>
               <Table>
                  <thead>
                     <tr>
                        <th>School</th>
                        <th>Training</th>
                        { /* <th>Students waiting registration validation</th> */ }
                        <th>Diplomas waiting validation</th>
                     </tr>
                  </thead>
                  <tbody>
                     { this.state.trainings.map((training, sindex) => 
                        <tr key={sindex}>
                           <td>{ training.school }</td>
                           <td>
                              { training.name } &nbsp;
                              { training.waiting && <Badge bg="secondary warning" className="bg-secondary bg-warning">Waiting validation</Badge> }
                           </td>
{ /*                           <td>
                              { training.count > 0 ?
                                 <a href={`/trainings/${training.id}/registration`}>{ training.count }</a> :
                                 training.count
                              }
                           </td>
                           */ }
                           <td>
                              <a href={`/trainings/${training.id}/validation`}>Validate</a>
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
