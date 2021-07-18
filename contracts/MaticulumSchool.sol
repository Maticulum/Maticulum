// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

import "./IMaticulum.sol";
import "./ISchool.sol";


contract MaticulumSchool is ISchool, Ownable {

   using EnumerableSet for EnumerableSet.AddressSet;
   using EnumerableSet for EnumerableSet.UintSet;


   struct School {
      string name;
      string town;
      string country;
      uint8 juryValidationThreshold;
      bool validated;
   }

   IMaticulum private maticulum;
   address private trainingContract;


   School[] public schools;
   uint256 public schoolRegistrationFees = 0.1 ether;
   uint8 public schoolValidationThreshold = 2;
   
   mapping(uint256 => EnumerableSet.AddressSet) schoolAdministrators;
   mapping(address => EnumerableSet.UintSet) administratorSchools;

   mapping(uint256 => EnumerableSet.AddressSet) schoolValidators;
   mapping(uint256 => EnumerableSet.UintSet) schoolTrainings;


   event SchoolAdded(uint256 schoolId, string name, string town, string country, uint8 juryValidationThreshold, address addedBy);
   event SchoolUpdated(uint256 schoolId, string name, string town, string country, uint8 juryValidationThreshold, address updatedBy);
   event SchoolAdminAdded(uint256 schoolId, address admin, address updatedBy);
   event SchoolValidated(uint256 schoolId, uint256 count, address validatedBy);

   event SchoolValidationThresholdUpdated(uint8 validationThreshold, address updatedBy);
   event SchoolRegistrationFeesUpdated(uint256 registrationFees, address updatedBy);


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


   function registerTrainingContract(address _trainingContract) external onlyOwner {
      trainingContract = _trainingContract;
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
      return schoolAdministrators[_schoolId].contains(_user);
   }


   function isValidated(uint256 _schoolId) external view override returns (bool) {
      return schools[_schoolId].validated;
   }


   function getJuryValidationThreshold(uint256 _schoolId) external view override returns (uint8) {
      return schools[_schoolId].juryValidationThreshold;
   }


   function addSchool(string memory _name, string memory _town, string memory _country, uint8 _juryValidationThreshold, address _admin1, address _admin2) 
         external
         onlyRegistered 
         returns (uint256) {
      schools.push(School(_name, _town, _country, _juryValidationThreshold, false));
      uint256 id = schools.length - 1;
      
      schoolAdministrators[id].add(_admin1);
      administratorSchools[_admin1].add(id);

      schoolAdministrators[id].add(_admin2);
      administratorSchools[_admin2].add(id);
      
      emit SchoolAdded(id, _name, _town, _country, _juryValidationThreshold, msg.sender);
      emit SchoolAdminAdded(id, _admin1, msg.sender);
      emit SchoolAdminAdded(id, _admin2, msg.sender);

      return id;
   }


   function addSchoolAdministrator(uint256 _schoolId, address _user) external {
      require(_isSchoolAdmin(_schoolId, msg.sender), "!SchoolAdmin");

      schoolAdministrators[_schoolId].add(_user);
      administratorSchools[_user].add(_schoolId);

      emit SchoolAdminAdded(_schoolId, _user, msg.sender);
   }


   function updateSchool(uint256 _schoolId, string memory _name, string memory _town, string memory _country, uint8 _juryValidationThreshold) external {
      require(_isSchoolAdmin(_schoolId, msg.sender), "!SchoolAdmin");

      School storage school = schools[_schoolId];      
      school.name = _name;
      school.town = _town;
      school.country = _country;
      school.juryValidationThreshold = _juryValidationThreshold;
      school.validated = false;

      delete schoolValidators[_schoolId];

      emit SchoolUpdated(_schoolId, _name, _town, _country, _juryValidationThreshold, msg.sender);
   }


   function updateSchoolValidationThreshold(uint8 _validationThreshold) external onlySuperAdmin {
      schoolValidationThreshold = _validationThreshold;

      emit SchoolValidationThresholdUpdated(_validationThreshold, msg.sender);
   }


   function updateSchoolRegistrationFees(uint256 _registrationFees) external onlySuperAdmin {
      schoolRegistrationFees = _registrationFees;

      emit SchoolRegistrationFeesUpdated(_registrationFees, msg.sender);
   }


   function validateSchool(uint256 _schoolId) external onlySuperAdmin {
      require(!schoolValidators[_schoolId].contains(msg.sender), "Already validated by this user.");

      schoolValidators[_schoolId].add(msg.sender);
      uint256 count = schoolValidators[_schoolId].length();
      if (count >= schoolValidationThreshold) {
         schools[_schoolId].validated = true;
      }
      
      emit SchoolValidated(_schoolId, count, msg.sender);
   }


   function getSchoolsCount() external view returns (uint256 length) {
      return schools.length;
   }


   function getSchoolAdministratorsCount(uint256 _schoolId) external view returns (uint256) {
      return schoolAdministrators[_schoolId].length();
   }


   function getSchoolAdministrator(uint256 _schoolId, uint256 index) external view returns (address) {
      return schoolAdministrators[_schoolId].at(index);
   }


   function getAdministratorSchoolsCount(address _admin) external view returns (uint256) {
      return administratorSchools[_admin].length();
   }


   function getAdministratorSchools(address _admin, uint256 _index) external view returns (uint256) {
      return administratorSchools[_admin].at(_index);
   }

 
   function getSchoolValidatorsCount(uint256 _schoolId) external view returns (uint256) {
      return schoolValidators[_schoolId].length();
   }


   function getSchoolValidator(uint256 _schoolId, uint256 index) external view returns (address) {
      return schoolValidators[_schoolId].at(index);
   }


   /**
   * @notice Get the number of trainings for a school
   * @param _schoolId   id of school
   * @return number of trainings
   */
   function getSchoolTrainingsCount(uint256 _schoolId) external view returns (uint256) {
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


   /**
   * @notice link a training to a school
   * @dev this function is only accessible to Training smartcontract
   * @param _schoolId   id of school
   * @param _trainingId id of training
   */
   function linkTraining(uint256 _schoolId, uint256 _trainingId) external override {
      require(msg.sender == trainingContract, "!auth");
      schoolTrainings[_schoolId].add(_trainingId);
   }

}
