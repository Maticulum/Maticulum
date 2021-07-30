import React, { Component } from 'react';
import { Table } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import Web3Context from '../../Web3Context';


class SuperAdminHome extends Component {

   static contextType = Web3Context;

   state = { init: false }

   async componentDidMount() {
      const admins = [];
      const cm = this.context.contractSchool.methods;

      const schoolsCount = await cm.getSchoolsCount().call();
      for (let schoolId = 0; schoolId < schoolsCount; schoolId++) {
         const waitings = await cm.getSchoolAdministratorsWaitingValidation(schoolId).call();
         if (waitings.length !== 0) {
            const school = await cm.schools(schoolId).call();

            admins.push({ id: schoolId, name: school.name, count: waitings.length });
         }
      }
      
      this.setState({ admins });
   }


   render() {
      if (this.state.admins === false) {
         return <div>Loading...</div>;
      }

      const { t } = this.props;  

      return (
         <>
            { this.state.admins && 
               <>
               <h3>{ t('school.schoolAdmin') }</h3>
               <Table>
                  <thead>
                     <tr>
                        <th>{ t('school.school') }</th>
                        <th>{ t('school.adminWaitingValidation') }</th>
                     </tr>
                  </thead>
                  <tbody>
                     { this.state.admins.map((admin, sindex) => 
                        <tr key={sindex}>
                           <td>{ admin.name }</td>
                           <td>
                              { admin.count > 0 ?
                                 <a href={`/schools/${admin.id}/validation`}>{ admin.count }</a> :
                                 admin.count
                              }
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

export default withTranslation()(withRouter(SuperAdminHome));
