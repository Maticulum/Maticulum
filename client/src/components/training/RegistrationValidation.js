import React, { Component } from 'react';
import { Button, Container, Form, Table } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import Web3Context from '../../Web3Context';


class RegsitrationValidation extends Component {

   static contextType = Web3Context;

   state = { users: null, training: null, school: null, checkedUsers: [] }


   async componentDidMount() {
      this.init();
   }


   init = async () => {
      const users = [];
      const cm = this.context.contractTraining.methods;

      const trainingId = this.props.match.params.trainingId;
      const training = await cm.trainings(trainingId).call();

      const isSchoolAdmin= await  this.context.contractSchool.methods.isSchoolAdmin(training.school, this.context.account);
      if (!isSchoolAdmin) {
         this.props.history.push('/');
         return;
      }
      
      const school = await this.context.contractSchool.methods.schools(training.school).call();
      const nbUsers = await cm.getUserWaitingTrainingValidationCount(trainingId).call()
      for (let i = 0; i < nbUsers; i++) {
         const userId = await cm.getUserWaitingTrainingValidation(trainingId, i).call();
         const user = await this.context.contract.methods.users(userId).call();

         users.push({ id: userId, ...user });
      }

      this.setState({ users, training, school, checkedUsers: [] });
   }


   onCheck = (userId, index, checked) => {
      const users = [...this.state.users];
      users[index].currentValidation = checked;
      this.setState({ users });

      if (checked) {
         this.setState({ checkedUsers: [...this.state.checkedUsers, userId ]});
      }
      else {
         const checkedUsers = [...this.state.checkedUsers];   
         const i  = checkedUsers.indexOf(userId);
         if (i !== -1) {
            checkedUsers.splice(i, 1);
            this.setState({ checkedUsers });
         }
      }
   }


   onValidate = async () => {
      if (this.state.checkedUsers) {
         const trainingId = this.props.match.params.trainingId;

         await this.context.contractTraining.methods.validateUserTrainingRequestMultiple(trainingId, this.state.checkedUsers).send({ from: this.context.account });
         this.init();
      }
   }


   render() {
      if (this.state.users === null) {
         return <div>Loading...</div>;
      }

      const { t } = this.props;  

      return (
         <Container>
            <h3>{ this.state.school.name } - { this.state.training.name }</h3>
            <Form>
               <Table>
                  <thead>
                     <tr>
                        <th>{t('table.address')}</th>
                        <th>{t('table.name')}</th>
                        <th>{t('table.validated')}</th>
                     </tr>
                  </thead>
                  <tbody>
                  { this.state.users.map((user, index) => (
                     <tr key={user.id}>
                        <td>{ user.id }</td>
                        <td>{ user.name }&nbsp;{ user.firstname }</td>
                        <td>
                           <Form.Check id={user.id} checked={ user.currentValidation }
                              onChange={ (e) => this.onCheck(user.id, index, e.target.checked) } />
                        </td>
                     </tr>
                  ))}
                  </tbody>
               </Table>
               <Button onClick={ this.onValidate } disabled={ !this.state.checkedUsers || this.state.checkedUsers.length === 0 } >{t('button.save')}</Button>
            </Form>
         </Container>
      );
   }
}

export default withTranslation()(withRouter(RegsitrationValidation));
