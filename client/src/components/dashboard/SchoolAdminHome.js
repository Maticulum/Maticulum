import React, { Component } from 'react';
import { Table } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import Web3Context from '../../Web3Context';


class SchoolAdminHome extends Component {

   static contextType = Web3Context;

   state = { adminSchools: [] }

   async componentDidMount() {
      const cm = this.context.contractSchool.methods;
      const cmTraining = this.context.contractTraining.methods;
      const schools = [];

      // Get diploma ready list
      const diplomasReady = [];
      const diplomasReadyCount = await cmTraining.getDiplomasReadyCount().call();
      for (let i = 0; i < diplomasReadyCount; i++) {
         const { trainingId, user } = await cmTraining.diplomasReady(i).call();
         diplomasReady.push({ trainingId, user });
      }

      const schoolIds = await cm.getAdministratorSchools(this.context.account).call();
      // For each school the user is school admin
      for (let i = 0; i < schoolIds.length; i++) {
         const schoolId = schoolIds[i];
         const school = await cm.schools(schoolId).call();

         const trainings = [];
         const trainingIds = await cm.getSchoolTrainings(schoolId).call();
         // For each training of the school
         for (let j = 0; j < trainingIds.length; j++) {
            const trainingId = trainingIds[j];
            const training = await cmTraining.trainings(trainingId).call();
            const juryIds = await cmTraining.getTrainingJuriesWaitingValidation(trainingId).call();
            const ready = diplomasReady.filter(e => e.trainingId === trainingId).length;
            trainings.push({ id: trainingId, ...training, juriesWaitingValidation: juryIds.length, ready });
         }

         console.log('trainings', trainings);
         schools.push({ id: schoolId, ...school, trainings });
      }

      this.setState({ adminSchools: schools });
   }


   render() {    
      const { t } = this.props;  

      return (
         <>
            { this.state.adminSchools && 
               this.state.adminSchools.map((school, index) =>
                  <div key={index}>
                     <h3>
                        <a href={`/schools/${school.id}`}>{ school.name }</a>
                     </h3>
                     <Table>
                        <thead>
                           <tr>
                              <th>{ t('training.training') }</th>
                              <th>{ t('training.juryValidation') }</th>
                              <th>{ t('training.diplomasReady') }</th>
                           </tr>
                        </thead>
                        <tbody>
                           { school.trainings.map((training, sindex) => 
                              <tr key={sindex}>
                                 <td>{ training.name }</td>
                                 <td>
                                    { training.juriesWaitingValidation > 0 ? 
                                       <a href={`/trainings/${training.id}/jury`}> {training.juriesWaitingValidation} </a> :
                                       training.juriesWaitingValidation
                                    }
                                 </td>
                                 <td>
                                    { training.ready }
                                 </td>
                              </tr> 
                           )}
                        </tbody>
                     </Table>
                  </div>
               )
            }
         </>
      );
   }
}

export default withTranslation()(withRouter(SchoolAdminHome));
