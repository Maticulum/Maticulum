import React, { Component } from 'react';
import { Badge, Container, Table } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import Web3Context from '../Web3Context';


class Home extends Component {

   static contextType = Web3Context;

   state = { adminSchools: null, juriesWaitingValidation: null, juryTrainings: null }


   async componentDidMount() {
      this.getSchoolAdminDetails();
      this.getJuryDetails();
      // TODO student details
   }


   getSchoolAdminDetails = async () => {
      const cm = this.context.contractSchool.methods;
      const cmTraining = this.context.contractTraining.methods;
      const schools = [];

      const schoolsCount = await cm.getAdministratorSchoolsCount(this.context.account).call();
      for (let i = 0; i < schoolsCount; i++) {
         const schoolId = await cm.getAdministratorSchools(this.context.account, i).call();
         const school = await cm.schools(schoolId).call();

         const trainings = [];
         const trainingsCount = await cm.getSchoolTrainingsCount(schoolId).call();
         for (let j = 0; j < trainingsCount; j++) {
            const trainingId = await cm.getSchoolTraining(schoolId, j).call();
            const training = await cmTraining.trainings(trainingId).call();

            const usersCount = await cmTraining.getUserWaitingTrainingValidationCount(trainingId).call();
            // TODO const juriesCount = await cmTraining.
            const juriesCount = 0;
            
            trainings.push({ id: trainingId, ...training, 
               usersWaitingValidation: usersCount, juriesWaitingValidation: juriesCount });
         }

         schools.push({ id: schoolId, ...school, trainings });
      }

      this.setState({ adminSchools: schools });
   }


   getJuryDetails = async () => {
      const juryTrainings = [];

      const cm = this.context.contractTraining.methods;
      const nbTrainings = await cm.getTrainingsCountForJury(this.context.account).call();
      for (let i = 0; i < nbTrainings; i++) {
         const trainingId = await cm.getTrainingForJury(this.context.account, i).call();
         const training = await cm.trainings(trainingId).call();

         juryTrainings.push({ id: trainingId, ...training });

         // TODO Jury request waiting validation
         // TODO diploma waiting validation
      }

      this.setState({ juryTrainings });
   }


   render() {
      if (this.state.juryTrainings === null) {
         return <div>Loading...</div>;
      }

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
                              <th>Registered users waiting validation</th>
                              <th>Juries waiting validation</th>
                           </tr>
                        </thead>
                        <tbody>
                           { school.trainings.map((training, sindex) => 
                              <tr key={sindex}>
                                 <td>{ training.name }</td>
                                 <td>
                                    { training.usersWaitingValidation > 0 ?
                                       <a href={`/trainings/${training.id}/registration`}> {training.usersWaitingValidation} </a> :
                                       training.usersWaitingValidation
                                    }
                                 </td>
                                 <td>
                                    { training.juriesWaitingValidation > 0 ? 
                                       <a href={`/trainings/${training.id}/jury`}> {training.juriesWaitingValidation} </a> :
                                       training.juriesWaitingValidation
                                    }
                                 </td>
                              </tr> 
                           )}
                        </tbody>
                     </Table>
                  </div>
               )
            }
            { this.state.juryTrainings && this.state.juryTrainings.length > 0 &&
               <>
               <h3>Jury pour les formations</h3>
               <ul>
               { this.state.juryTrainings.map((training, index) => 
                  <li key={index}><a href={`/trainings/${training.id}/validation`}>{ training.name }</a></li>
               )}
               </ul>
               </>
            }
         </Container>
      );
   }
}

export default withTranslation()(withRouter(Home));
