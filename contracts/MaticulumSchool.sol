// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

import "./IMaticulum.sol";
import "./ISchool.sol";


contract MaticulumSchool is ISchool, Ownable {

   using EnumerableSet for EnumerableSet.UintSet;


   struct School {
      string name;
      string town;
      string country;
      bool validated;
      address[] administrators;
      address[] validators;
   }

   IMaticulum private maticulum;

   School[] public schools;
   uint256 public schoolRegistrationFees = 0.1 ether;
   uint8 public schoolValidationThreshold = 2;
   mapping(uint256 => EnumerableSet.UintSet) schoolTrainings;


   event SchoolAdded(uint256 id, string name, string town, string country, address addedBy);
   event SchoolUpdated(uint256 id, string name, string town, string country, address updatedBy);
   event SchoolAdminAdded(uint256 id, address admin, address updatedBy);
   event SchoolValidationThresholdUpdated(uint8 validationThreshold, address updatedBy);
   event SchoolRegistrationFeesUpdated(uint256 registrationFees, address updatedBy);
   event SchoolValidated(uint256 id, string name, address validator, uint256 count);


    modifier onlySuperAdmin() {
      require(maticulum.isSuperAdmin(msg.sender), "!SuperAdmin");
      _;
   }

  
   modifier onlyRegistered() {
      require(maticulum.isRegistered(msg.sender), "!Registered");
      _;
   }


   constructor(address _maticulum) {
      maticulum = IMaticulum(_maticulum);
   }


   /**
   * @notice Checks that a user is admin of a given school
   * @param _user       user address
   * @param _schoolId   id of the school
   * @return true if the user is admin of the school
   */
   function isSchoolAdmin(uint256 _schoolId, address _user) external view override returns (bool) {
      return _isSchoolAdmin(_schoolId, _user);
   }


   function _isSchoolAdmin(uint256 _schoolId, address _user) internal view returns (bool) {
      School memory school = schools[_schoolId];
      bool found = false;
      for (uint256 i = 0; i < school.administrators.length; i++) {
         if (school.administrators[i] == _user) {
            found = true;
            break;
         }
      }

      return found;
   }


   function isValidated(uint256 _schoolId) external view override returns (bool) {
      return schools[_schoolId].validated;
   }


   function addSchool(string memory _name, string memory _town, string memory _country, address _admin1, address _admin2) 
         external
         onlyRegistered 
         returns (uint256) {
      School memory school;
      school.name = _name;
      school.town = _town;
      school.country = _country;

      address[] memory administrators = new address[](2);
      administrators[0] = _admin1;
      administrators[1] = _admin2;
      school.administrators = administrators;
      schools.push(school);

      uint256 id = schools.length - 1;
      emit SchoolAdded(id, _name, _town, _country, msg.sender);
      emit SchoolAdminAdded(id, _admin1, msg.sender);
      emit SchoolAdminAdded(id, _admin2, msg.sender);

      return id;
   }


   function addSchoolAdministrator(uint256 _schoolId, address _user) external {
      require(_isSchoolAdmin(_schoolId, msg.sender), "!SchoolAdmin");

      schools[_schoolId].administrators.push(_user);

      emit SchoolAdminAdded(_schoolId, _user, msg.sender);
   }


   function updateSchool(uint256 _schoolId, string memory _name, string memory _town, string memory _country) external {
      require(_isSchoolAdmin(_schoolId, msg.sender), "!SchoolAdmin");

      School storage school = schools[_schoolId];      
      school.name = _name;
      school.town = _town;
      school.country = _country;
      delete school.validators;

      emit SchoolUpdated(_schoolId, _name, _town, _country, msg.sender);
   }


   function updateSchoolValidationThreshold(uint8 _validationThreshold) external onlySuperAdmin {
      schoolValidationThreshold = _validationThreshold;

      emit SchoolValidationThresholdUpdated(_validationThreshold, msg.sender);
   }


   function updateSchoolRegistrationFees(uint256 _registrationFees) external onlySuperAdmin {
      schoolRegistrationFees = _registrationFees;

      emit SchoolRegistrationFeesUpdated(_registrationFees, msg.sender);
   }


   function validateSchool(uint256 _id) external onlySuperAdmin {
      School storage school = schools[_id];

      for (uint256 i = 0; i < school.validators.length; i++) {
         if (school.validators[i] == msg.sender) {
               revert("Already validated by this user.");
         }
      }
      
      school.validators.push(msg.sender);
      if (school.validators.length >= schoolValidationThreshold) {
         school.validated = true;
      }
      
      emit SchoolValidated(_id, school.name, msg.sender, school.validators.length);
   }


   function getNbSchools() external view returns (uint256 length) {
      return schools.length;
   }


   function getSchool(uint256 _id) external view onlyRegistered 
         returns(string memory name, string memory town, string memory country, address[] memory administrators, address[] memory validators) {
      School storage school = schools[_id];

      return (school.name, school.town, school.country, school.administrators, school.validators);
   }


   /**
   * @notice Get the number of trainings for a school
   * @param _schoolId   id of school
   * @return number of trainings
   */
   function getSchoolNbTrainings(uint256 _schoolId) external view returns (uint256) {
      return schoolTrainings[_schoolId].length();
   }


   /**
   * @notice Get a training for specified school
   * @param _schoolId      id of school
   * @param _index   index of training
   * @return address of jury
   */
   function getSchoolTraining(uint256 _schoolId, uint256 _index) external view returns (uint256) {
      return schoolTrainings[_schoolId].at(_index);
   }


   // TODO restreindre l'accès
   function linkTraining(uint256 _schoolId, uint256 _trainingId) external override {
      schoolTrainings[_schoolId].add(_trainingId);
   }

}