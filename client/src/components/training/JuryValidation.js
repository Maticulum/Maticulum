import React, { Component } from 'react';
import { Accordion, Button, Container, Form, Table } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import Web3Context from '../../Web3Context';


class JuryValidation extends Component {

   static contextType = Web3Context;

   state = { juries: null, training: null, school: null, checkedUsers: [] }


   async componentDidMount() {
      this.init();
   }


   init = async () => {
      const juries = [];
      const cm = this.context.contractTraining.methods;
      const trainingId = this.props.match.params.trainingId;

      const training = await cm.trainings(trainingId).call();
      const school = await this.context.contractSchool.methods.schools(training.school).call();

      const isSchoolAdmin = await this.context.contractSchool.methods.isSchoolAdmin(training.school, this.context.account);
      if (!isSchoolAdmin) {
         this.props.history.push('/');
         return;
      }

      const juriesId = [];
      const nbJuries = await cm.getTrainingJuriesCount(trainingId).call();
      for (let i = 0; i < nbJuries; i++) {
         juriesId.push(await cm.getTrainingJury(trainingId, i).call());
      }
      const nbWaiting = await cm.getTrainingJuriesWaitingValidationCount(trainingId).call();
      for (let i = 0; i < nbWaiting; i++) {
         juriesId.push(await cm.getTrainingJuryWaitingValidation(trainingId, i).call());
      }

      for (let i = 0; i < juriesId.length; i++) {
         const juryId = juriesId[i];
         const jury = await this.context.contract.methods.users(juryId).call();

         const { validated, count } = await cm.getJuryValidationStatus(trainingId, juryId).call();
         const validators = [];
         let validatedByAdmin = false;
         for (let j = 0; j < count; j++) {
            const validator = await cm.getJuryValidator(trainingId, juryId, j).call();
            validatedByAdmin |= validator === this.context.account;
            validators.push(validator);
         }

         juries.push({ id: juryId, ...jury, validated, validatedByAdmin, count, validators });
      }

      this.setState({ juries, training, school });
      console.log("JURYVAL", this.state);
   }


   onCheck = (userId, index, checked) => {
      const juries = [...this.state.juries];
      juries[index].currentValidation = checked;
      this.setState({ juries });

      if (checked) {
         this.setState({ checkedUsers: [...this.state.checkedUsers, userId ]});
      }
      else {
         const checkedUsers = [...this.state.checkedUsers];   
         const i = checkedUsers.indexOf(userId);
         if (i !== -1) {
            checkedUsers.splice(i, 1);
            this.setState({ checkedUsers });
         }
      }
   }


   onValidate = async () => {
      if (this.state.checkedUsers) {
         const trainingId = this.props.match.params.trainingId;

         await this.context.contractTraining.methods.validateJuryMultiple(trainingId, this.state.checkedUsers).send({ from: this.context.account });
         this.init();
      }
   }


   render() {
      if (this.state.juries === null) {
         return <div>Loading...</div>;
      }

      const { t } = this.props;  

      return (
         <Container>
            <h3>{ this.state.school.name } - Juries for: { this.state.training.name }</h3>
            <Form>
               <Table>
                  <thead>
                     <tr>
                        <th>{t('table.address')}</th>
                        <th>{t('table.name')}</th>
                        <th colSpan="2">{t('table.validated')}</th>
                     </tr>
                  </thead>
                  <tbody>
                  { this.state.juries.map((jury, index) => (
                     <tr key={jury.id}>
                        <td>{ jury.id }</td>
                        <td>{ jury.name }&nbsp;{ jury.firstname }</td>
                        <td>
                           <Form.Check id={jury.id} 
                              checked={ jury.currentValidation || jury.validatedByAdmin || jury.validated } 
                              disabled={ jury.validated || jury.validatedByAdmin }
                              onChange={ (e) => this.onCheck(jury.id, index, e.target.checked) } />
                        </td>
                        <td>{ jury.count }&nbsp;/&nbsp;{ this.state.training.validationThreshold }</td>
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

export default withTranslation()(withRouter(JuryValidation));
