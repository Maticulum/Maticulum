import React, { Component } from 'react';
import { Button, Container, Form, Table } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import Web3Context from '../Web3Context';


class Validation extends Component {

   static contextType = Web3Context;

   state = { users: null, training: null, school: null }


   async componentDidMount() {
      const users = [];

      const trainingId = this.props.match.params.trainingId;
      // TODO check user is jury 
      const cm = this.context.contract.methods;
      const training = await cm.trainings(trainingId).call();
      const school = await cm.schools(training.school).call();

      const nbUsers = await cm.getUsersNbForTraining(trainingId).call()
      for (let i = 0; i < nbUsers; i++) {
         const userId = await cm.getUserForTraining(trainingId, i).call();
         const user = await cm.users(userId).call();
         console.log(userId);

         users.push({ id: userId, ...user });
      }

      this.setState({ users, training, school });
   }


   onValidate = () => {
      
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
                  { this.state.users.map(user => (
                     <tr key={user.id}>
                        <td>{ user.id }</td>
                        <td>{ user.name }&nbsp;{ user.firstname }</td>
                        <td>
                           <Form.Check id={user.id} />
                        </td>
                     </tr>
                  ))}
                  </tbody>
               </Table>
               <Button onClick={ this.onValidate } >{t('button.save')}</Button>
            </Form>
         </Container>
      );
   }
}

export default withTranslation()(withRouter(Validation));
