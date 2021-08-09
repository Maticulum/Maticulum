// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./openzeppelin/EnumerableSet.sol";

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
   }

   IMaticulum private maticulum;
   address private trainingContract;

   /// Schools list
   School[] public schools;

   /// Fees when a school is registered
   /// @dev As Matic faucet deliver only 0.1 TMATIC / request, this is a low amount
   uint256 public schoolRegistrationFees = 0.1 ether;

   /// Number of Maticulum admin to approve a school registration, or a school admin request
   uint8 public schoolValidationThreshold = 2;
   
   /// List of (school, school administrator)
   mapping(uint256 => EnumerableSet.AddressSet) schoolAdministrators;
   mapping(address => EnumerableSet.UintSet) administratorSchools;

   /// List of (school, school administrator) waiting validation from superAdmin
   mapping(uint256 => EnumerableSet.AddressSet) schoolAdministratorsWaitingValidation;
   mapping(address => EnumerableSet.UintSet) administratorSchoolsWaitingValidation;
   mapping(uint256 => mapping(address => EnumerableSet.AddressSet)) adminValidations;

   /// List of trainings for a school
   mapping(uint256 => EnumerableSet.UintSet) schoolTrainings;


   event SchoolAdded(uint256 schoolId, string name, string town, string country, uint8 juryValidationThreshold, address addedBy);
   event SchoolUpdated(uint256 schoolId, string name, string town, string country, uint8 juryValidationThreshold, address updatedBy);
   event SchoolAdminAdded(uint256 schoolId, address admin, address updatedBy);
   event SchoolAdminValidated(uint256 schoolId, address admin, uint256 count, address updatedBy);

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


   /// @dev Duplicate of above function, needed as override function must be external...
   function _isSchoolAdmin(uint256 _schoolId, address _user) internal view returns (bool) {
      return schoolAdministrators[_schoolId].contains(_user);
   }


   /**
   * @notice Get the number of juries needed to validate a training registration
   * @dev This value is common for all the trainings in a school
   * @param _schoolId   id of school
   * @return Number of juries
   */
   function getJuryValidationThreshold(uint256 _schoolId) external view override returns (uint8) {
      return schools[_schoolId].juryValidationThreshold;
   }


   /**
   * @notice Add a new school
   * @dev 2 admins must be provided at creation
   * @param _name    School name
   * @param _town     School town
   * @param _country School country
   * @param _juryValidationThreshold   number of juries to validate a training
   * @param _admin1  address of first school admin
   * @param _admin2  address of second school admin
   */
   function addSchool(string memory _name, string memory _town, string memory _country, uint8 _juryValidationThreshold, address _admin1, address _admin2) 
         external payable
         onlyRegistered {
      require(msg.value == schoolRegistrationFees, "MissingFees");
      if (!maticulum.getFeesReceiver().send(msg.value)) {
         revert("Error sending fess");
      }

      schools.push(School(_name, _town, _country, _juryValidationThreshold));
      uint256 id = schools.length - 1;
      
      addSchoolAdministrator(id, _admin1);
      addSchoolAdministrator(id, _admin2);

      emit SchoolAdded(id, _name, _town, _country, _juryValidationThreshold, msg.sender);
   }


   /**
   * @notice Update a school
   * @param _name    School name
   * @param _town     School town
   * @param _country School country
   * @param _juryValidationThreshold   number of juries to validate a training
   */
   function updateSchool(uint256 _schoolId, string memory _name, string memory _town, string memory _country, uint8 _juryValidationThreshold) external {
      require(_isSchoolAdmin(_schoolId, msg.sender), "!SchoolAdmin");

      School storage school = schools[_schoolId];      
      school.name = _name;
      school.town = _town;
      school.country = _country;
      school.juryValidationThreshold = _juryValidationThreshold;

      emit SchoolUpdated(_schoolId, _name, _town, _country, _juryValidationThreshold, msg.sender);
   }


   /**
   * @notice Add a school admin for a specified school
   * @param _schoolId   id of school
   * @param _user       user address
   */
   function addSchoolAdministrator(uint256 _schoolId, address _user) public onlyRegistered {
      schoolAdministratorsWaitingValidation[_schoolId].add(_user);
      administratorSchoolsWaitingValidation[_user].add(_schoolId);

      emit SchoolAdminAdded(_schoolId, _user, msg.sender);
   }


   /**
   * @notice Validate an administrator (By a Maticulum admin). Require schoolValidationThreshold validations.
   * @param _schoolId   id of school
   * @param _user       user address
   */
   function validateAdministrator(uint256 _schoolId, address _user) internal {
      require(!schoolAdministrators[_schoolId].contains(_user), "Already admin");
      require(!adminValidations[_schoolId][_user].contains(msg.sender), "Already validated by this superadmin");

      adminValidations[_schoolId][_user].add(msg.sender);

      uint256 count = adminValidations[_schoolId][_user].length();
      if (count >= schoolValidationThreshold) {
         schoolAdministrators[_schoolId].add(_user);
         administratorSchools[_user].add(_schoolId);

         schoolAdministratorsWaitingValidation[_schoolId].remove(_user);
         administratorSchoolsWaitingValidation[_user].remove(_schoolId);
      }

      emit SchoolAdminValidated(_schoolId, _user, count, msg.sender);
   }


  /**
   * @notice Validate multiple administrators
   * @param _schoolId   id of school
   * @param _users      users addresses
   */
   function validateAdministratorMultiple(uint256 _schoolId, address[] memory _users) external {
      require(maticulum.isSuperAdmin(msg.sender), "!SuperAdmin");

      for (uint256 i = 0; i < _users.length; i++) {
         validateAdministrator(_schoolId, _users[i]);
      }
   }


   /**
   * @notice Update the number of Maticulum admins needed to validate a school admin
   * @param _validationThreshold    validation admin number
   */
   function updateSchoolValidationThreshold(uint8 _validationThreshold) external onlySuperAdmin {
      schoolValidationThreshold = _validationThreshold;

      emit SchoolValidationThresholdUpdated(_validationThreshold, msg.sender);
   }


   /**
   * @notice Update the school registration fees
   * @param _registrationFees    fees (in wei)
   */
   function updateSchoolRegistrationFees(uint256 _registrationFees) external onlySuperAdmin {
      schoolRegistrationFees = _registrationFees;

      emit SchoolRegistrationFeesUpdated(_registrationFees, msg.sender);
   }


   /**
   * @notice Get the number of schools
   * @return school count
   */
   function getSchoolsCount() external view returns (uint256) {
      return schools.length;
   }


   /**
   * @notice Get the admins list for a given school
   * @param _schoolId   id of school
   * @return addresses of admin
   */
   function getSchoolAdministrators(uint256 _schoolId) external view returns (address[] memory) {
      return schoolAdministrators[_schoolId].values();
   }


   /**
   * @notice Get the admins list waiting validation for a given school
   * @param _schoolId   id of school
   * @return addresses of admin
   */
   function getSchoolAdministratorsWaitingValidation(uint256 _schoolId) external view returns (address[] memory) {
      return schoolAdministratorsWaitingValidation[_schoolId].values();
   }


   /**
   * @notice Get the schools for a given admin and index
   * @param _admin      user address
   * @return schools id
   */
   function getAdministratorSchools(address _admin) external view returns (uint256[] memory) {
      return administratorSchools[_admin].values();
   }


   /**
   * @notice Get the status of an admin validation
   * @param _schoolId      id of school
   * @param _admin         admin address
   * @return validated     true if the admin is validated
   * @return count         nb of super admins who have validated this admin
   */
   function getAdminValidationStatus(uint256 _schoolId, address _admin) external view returns (bool validated, uint256 count) {
      count = adminValidations[_schoolId][_admin].length();
      validated = count >= schoolValidationThreshold;
   }


   /**
   * @notice Get the address who validates this admin, for the given school
   * @param _schoolId   id of school
   * @param _admin      admin address
   * @return the addresses of validators
   */
   function getAdminValidators(uint256 _schoolId, address _admin) external view returns (address[] memory) {
      return adminValidations[_schoolId][_admin].values();
   }


   /**
   * @notice Get trainings list for specified school
   * @param _schoolId      id of school
   * @return address of jury
   */
   function getSchoolTrainings(uint256 _schoolId) external view returns (uint256[] memory) {
      return schoolTrainings[_schoolId].values();
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
