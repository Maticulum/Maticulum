import React, { Component } from 'react';
import { Button, Container, Form, Table } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import Web3Context from '../../Web3Context';


class AdminValidation extends Component {

   static contextType = Web3Context;

   state = { admins: null, school: null, checkedUsers: [] }


   async componentDidMount() {
      this.init();
   }


   init = async () => {
      const admins = [];
      const cm = this.context.contractSchool.methods;
      const schoolId = this.props.match.params.schoolId;

      const validationThreshold = await cm.schoolValidationThreshold().call();
      const school = await cm.schools(schoolId).call();

      const user = await this.context.contract.methods.users(this.context.account).call();
      if ((user.role & 0x80) !== 0x80) {
         this.props.history.push('/');
         return;
      }

      const adminIds = [];
      const nbAdmins = await cm.getSchoolAdministratorsCount(schoolId).call();
      for (let i = 0; i < nbAdmins; i++) {
         adminIds.push(await cm.getSchoolAdministrator(schoolId, i).call());
      }
      const nbWaiting = await cm.getSchoolAdministratorsWaitingValidationCount(schoolId).call();
      for (let i = 0; i < nbWaiting; i++) {
         adminIds.push(await cm.getSchoolAdministratorWaitingValidation(schoolId, i).call());
      }

      for (let i = 0; i < adminIds.length; i++) {
         const adminId = adminIds[i];
         const admin = await this.context.contract.methods.users(adminId).call();

         const { validated, count } = await cm.getAdminValidationStatus(schoolId, adminId).call();
         const validators = [];
         let validatedByAdmin = false;
         for (let j = 0; j < count; j++) {
            const validator = await cm.getAdminValidator(schoolId, adminId, j).call();
            validatedByAdmin |= validator === this.context.account;
            validators.push(validator);
         }

         admins.push({ id: adminId, ...admin, validated, validatedByAdmin, count, validators });
      }

      this.setState({ admins, school, validationThreshold });
   }


   onCheck = (userId, index, checked) => {
      const admins = [...this.state.admins];
      admins[index].currentValidation = checked;
      this.setState({ admins });

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
         const schoolId = this.props.match.params.schoolId;

         await this.context.contractSchool.methods.validateAdministratorMultiple(schoolId, this.state.checkedUsers).send({ from: this.context.account });
         this.init();
      }
   }


   render() {
      if (this.state.admins === null) {
         return <div>Loading...</div>;
      }

      const { t } = this.props;  

      return (
         <Container>
            <h3>Admin validation - { this.state.school.name }</h3>
            <Form>
               <Table>
                  <thead>
                     <tr>
                        <th>{t('table.address')}</th>
                        <th colSpan="2">{t('table.validated')}</th>
                     </tr>
                  </thead>
                  <tbody>
                  { this.state.admins.map((admin, index) => (
                     <tr key={admin.id}>
                        <td>{ admin.id }</td>
                        <td>
                           <Form.Check id={admin.id} 
                              checked={ admin.currentValidation || admin.validatedByAdmin || admin.validated } 
                              disabled={ admin.validated || admin.validatedByAdmin }
                              onChange={ (e) => this.onCheck(admin.id, index, e.target.checked) } />
                        </td>
                        <td>{ admin.count }&nbsp;/&nbsp;{ this.state.validationThreshold }</td>
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

export default withTranslation()(withRouter(AdminValidation));
