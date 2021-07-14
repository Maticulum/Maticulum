// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;


interface ISchool {

   function isSchoolAdmin(uint256 _schoolId, address _user) external view returns (bool);
   
   function isValidated(uint256 _schoolId) external view returns (bool);

   function linkTraining(uint256 _schoolId, uint256 trainingId) external;

}