import React, { Component } from 'react';
import { Button, Col, Container, Form, Row, Table } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import Web3Context from '../../Web3Context';


class TrainingChoice extends Component {

   static contextType = Web3Context;

   state = { schools: [], trainings: [], selectedSchool: null, userSelected:null }


   async componentDidMount() {
      const cmSchool = this.context.contractSchool.methods;
      const cmTraining = this.context.contractTraining.methods;
      const schools = [];

      const shoolsCount = await cmSchool.getSchoolsCount().call();
      for (let i = 0; i < shoolsCount; i++) {
         const school = await cmSchool.schools(i).call();
         
         const trainings = [];
         const trainingsCount = await cmTraining.getTrainingsCount().call();
         for (let j = 0; j < trainingsCount; j++) {
            const training = await cmTraining.trainings(j).call();

            trainings.push({ id: j, ...training });
         }

         schools.push({ id: i, ...school, trainings });
      }

      schools.sort((a, b) => a.name - b.name);
      this.setState({ schools });
   }


   onSchoolChange = async (schoolId) => {
      const trainings = [];

      if (!isNaN(schoolId)) {
         const cmSchool = this.context.contractSchool.methods;
         const cmTraining = this.context.contractTraining.methods;

         const trainingIds = await cmSchool.getSchoolTrainings(schoolId).call();
         for (let i = 0; i< trainingIds.length; i++) {
            const trainingId = trainingIds[i];
            const training = await cmTraining.trainings(trainingId).call();
            const { registered, validated } = await cmTraining.getRegistrationStatus(trainingId, this.context.account).call();
            trainings.push({ id: trainingId, ...training, registered, validated });
         }
      }

      this.setState({ trainings, selectedSchool: schoolId });
   }


   onRegister = async (trainingId) => {
	   await this.context.contractTraining.methods
	      .validateUserTrainingRequestDirect(this.state.trainings[trainingId].id, this.state.trainings[trainingId].user).send({from: this.context.account});
      
      this.onSchoolChange(this.state.selectedSchool);
   }

   
   onChangeUser = (value, index) => {
      const trainings = [...this.state.trainings]; 	  
      trainings[index].user = value;
      this.setState({ trainings });
   }


   render() {
      if (this.state.schools === null) {
         return <div>Loading...</div>;
      }

      const { t } = this.props;  

      return (
         <Container>
            <Form>
				<Form.Group as={Row} >
					<Form.Label column sm="3"></Form.Label>
				</Form.Group>
               <Form.Group as={Row}>
                  <Form.Label column sm="2">School</Form.Label>
                  <Col sm="10">
                     <Form.Control as="select" onChange={e => this.onSchoolChange(e.target.value)}>
                        <option>Select a school</option>
                        { this.state.schools.map((school, index) =>
                           <option key={index} value={school.id}>{ school.name }, { school.town } ({ school.country })</option>
                        )}
                     </Form.Control>
                  </Col>
               </Form.Group>
            </Form>
            <Table>
               <thead>
                  <tr>
                     <th>{ t('training.name') }</th>
                     <th>{ t('training.hours') }</th>
					      <th>{ t('training.address') }</th>
                     <th>{ t('training.register') }</th>
                  </tr>
               </thead>
               <tbody>
                  { this.state.trainings.map((training, index) => 
                     <tr key={training.id}>
                        <td>{ training.name }</td>
                        <td>{ training.duration }</td>
                        <td>
                           <Form.Control type="text" 
                              value={ this.state.trainings[index].user || '' }
                              onChange={ e => this.onChangeUser(e.target.value, index) }
                           />
                        </td>
                        <td>
                           <Button variant="outline-primary" onClick={ () => this.onRegister(index) }>{ t('training.register') }</Button>
                        </td>
                     </tr>
                  )}
               </tbody>
            </Table>
         </Container>
      );
   }
}

export default withTranslation()(withRouter(TrainingChoice));
