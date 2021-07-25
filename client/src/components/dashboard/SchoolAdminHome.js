import React, { Component } from 'react';
import { Badge, Container, Table } from 'react-bootstrap';
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
      const diplomasReadyCount = cmTraining.getDiplomasReadyCount().call();
      for (let i = 0; i < diplomasReadyCount; i++) {
         const { trainingId, user } = cmTraining.diplomasReady(i).call();
         diplomasReady.push({ trainingId, user });
      }
      const diplomasReadyByTraining = diplomasReady.reduce((map, obj) => map[obj.trainingId] = obj.user, {});

      const schoolsCount = await cm.getAdministratorSchoolsCount(this.context.account).call();
      // For each school the user is school admin
      for (let i = 0; i < schoolsCount; i++) {
         const schoolId = await cm.getAdministratorSchools(this.context.account, i).call();
         const school = await cm.schools(schoolId).call();

         const trainings = [];
         const trainingsCount = await cm.getSchoolTrainingsCount(schoolId).call();
         // For each training of the school
         for (let j = 0; j < trainingsCount; j++) {
            const trainingId = await cm.getSchoolTraining(schoolId, j).call();
            const training = await cmTraining.trainings(trainingId).call();

            const juriesCount = await cmTraining.getTrainingJuriesWaitingValidationCount(trainingId).call();
            
            trainings.push({ id: trainingId, ...training, juriesWaitingValidation: juriesCount });
         }

         schools.push({ id: schoolId, ...school, trainings });
      }

      this.setState({ adminSchools: schools });
   }


   render() {    
      const { t } = this.props;  

      return (
         <Container>
            { this.state.adminSchools && 
               this.state.adminSchools.map((school, index) =>
                  <div key={index}>
                     <h3>
                        <a href={`/schools/${school.id}`}>{ school.name }</a>
                        &nbsp;
                        <Badge style={{fontSize: '50%' }}
                           bg={ 'secondary ' + (school.validated ? 'success' : 'warning')}
                           className={ 'bg-secondary ' +  (school.validated ? 'bg-success' : 'bg-warning')} >
                           {school.validated ? 'Validated' : 'Waiting validation'}
                        </Badge>
                     </h3>
                     <Table>
                        <thead>
                           <tr>
                              <th>Training</th>
                              <th>Juries waiting validation</th>
                              <th>Diplomas ready</th>
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

                                 </td>
                              </tr> 
                           )}
                        </tbody>
                     </Table>
                  </div>
               )
            }
         </Container>
      );
   }
}

export default withTranslation()(withRouter(SchoolAdminHome));
