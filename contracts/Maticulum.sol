// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "./MaticulumNFT.sol";

contract Maticulum is Ownable {

   using EnumerableSet for EnumerableSet.UintSet;
   using EnumerableSet for EnumerableSet.AddressSet;
   

   struct User {
      string name;
      string firstname;
      string birthCountry;
      string birthDate;
      string matricule;
      string mail;
      string mobile;
      string telfixe;
      uint8 role;
   }
   
   struct School {
      string name;
      string town;
      string country;
      address[] administrators;
      address[] validators;
      uint256[] trainings;
   }

   struct Training {
      uint256 school;
      string name;
      string level;
      uint16 duration;
      uint16 validationThreshold;
   }
   

   uint8 constant SUPER_ADMIN_MASK = 0x80;
   uint8 constant VALIDATED_MASK = 0x02;
   uint8 constant REGISTERED_MASK = 0x01;


   MaticulumNFT public nft;

   mapping(address => User) users;
   address firstAdminUniveristy;
   bool hasAdmin;
   
   School[] schools;
   uint256 public schoolRegistrationFees = 0.1 ether;
   uint8 public schoolValidationThreshold = 2;
   address feesReceiver;
   
   Training[] trainings;
   mapping(uint256 => EnumerableSet.AddressSet) trainingJuries;
   mapping(address => EnumerableSet.UintSet) userJuryTrainings;


   event UserCreated(address userAdress);
   
   event SchoolAdded(uint256 id, string name, string town, string country, address addedBy);
   event SchoolUpdated(uint256 id, string name, string town, string country, address updatedBy);
   event SchoolAdminAdded(uint256 id, address admin, address updatedBy);
   event SchoolValidationThresholdUpdated(uint8 validationThreshold, address updatedBy);
   event SchoolRegistrationFeesUpdated(uint256 registrationFees, address updatedBy);
   event SchoolValidated(uint256 id, string name, address validator, uint256 count);

   event TrainingAdded(uint256 schoolId, uint256 trainingId, string name, string level, uint16 duration, uint16 validationThreshold, address addedBy);
   event TrainingUpdated(uint256 schoolId, uint256 trainingId, string name, string level, uint16 duration, uint16 validationThreshold, address updatedBy);

   event JuryAdded(uint256 schoolId, uint256 trainingId, address jury, address addedBy);
   event JuryRemoved(uint256 schoolId, uint256 trainingId, address jury, address removedBy);
   event JuryValidated(uint256 schoolId, uint256 trainingId, address jury, address validator, uint16 count);
   

   modifier onlySuperAdmin() {
      require((users[msg.sender].role & SUPER_ADMIN_MASK) == SUPER_ADMIN_MASK, "!SuperAdmin");
      _;
   }

   modifier onlySchoolAdmin(uint256 _id) {
      require(isSchoolAdmin(_id), "!SchoolAdmin");

      _;
   }

   modifier onlyRegistered() {
      require(users[msg.sender].role != 0, "!Registered");
      _;
   }

   modifier schoolValidated(uint256 id) {
      require(isSchoolValidated(id), "!schoolValidated");
      _;
   }


   constructor() {
      nft = new MaticulumNFT();
      feesReceiver = msg.sender;
   }


   function setSuperAdmin(address userAdress) external onlyOwner {
      users[userAdress].role |= SUPER_ADMIN_MASK;
   }
   

   function registerUser(string memory name, string memory firstname, string memory birthCountry, string memory birthDate,
         string memory mail, string memory telfixe, string memory mobile) external {
      users[msg.sender].role = REGISTERED_MASK;
      updateUser(name, firstname,mail, telfixe, mobile, birthCountry, birthDate);
   }
   

   function updateUser(string memory name, string memory firstname, string memory birthCountry, string memory birthDate,
         string memory mail, string memory telfixe, string memory mobile) 
         public
         onlyRegistered {
      users[msg.sender].name = name;
      users[msg.sender].firstname = firstname;
      users[msg.sender].birthCountry = birthCountry;
      users[msg.sender].birthDate = birthDate;
      users[msg.sender].mail = mail;
      users[msg.sender].telfixe = telfixe;
      users[msg.sender].mobile = mobile;
   }
   

   function getUser() external view returns(User memory) {
      return users[msg.sender];
   }
   

   function isRegistered() external view returns(bool) {
      return isRegistered(msg.sender);
   }


   function isRegistered(address _user) public view returns(bool) {
      return users[_user].role != 0;
   }


   /**
   * @notice Checks that a user is admin of a given school
   * @param _id   id of the school
   * @return true if the user is admin of the school
   */
   function isSchoolAdmin(uint256 _id) public view returns (bool) {
      School memory school = schools[_id];
      bool found = false;
      for (uint256 i = 0; i < school.administrators.length; i++) {
         if (school.administrators[i] == msg.sender) {
            found = true;
            break;
         }
      }

      return found;
   }
   

   /**
   * @notice Check that a user is jury of given training
   * @param _id   id of the training
   * @
   */
   function isSchoolJury(uint _id) public view returns (bool) {

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


   function addSchoolAdministrator(uint256 _id, address _administrator) external onlySchoolAdmin(_id) {
      schools[_id].administrators.push(_administrator);

      emit SchoolAdminAdded(_id, _administrator, msg.sender);
   }


   function updateSchool(uint256 _id, string memory _name, string memory _town, string memory _country) external onlySchoolAdmin(_id) {
      School storage school = schools[_id];      
      school.name = _name;
      school.town = _town;
      school.country = _country;
      delete school.validators;

      emit SchoolUpdated(_id, _name, _town, _country, msg.sender);
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
      
      emit SchoolValidated(_id, school.name, msg.sender, school.validators.length);
   }


   function getNbSchools() external view returns (uint256 length) {
      return schools.length;
   }


   function getSchool(uint256 _id) external view onlyRegistered 
         returns(string memory name, string memory town, string memory country, address[] memory administrators, address[] memory validators, uint256[] memory _trainings) {
      School storage school = schools[_id];

      return (school.name, school.town, school.country, school.administrators, school.validators, school.trainings);
   }


   function isSchoolValidated(uint256 _id) public view returns (bool) {
      return schools[_id].validators.length >= schoolValidationThreshold;
   }


   /**
   * @notice Registers a school's training 
   * @param _schoolId   id of the school
   * @param _name       training name
   * @param _level      training level
   * @param _duration   training duration, in hours
   * @param _validationThreshold  number of validation by a jury to validate a user diploma
   * @return the id of the saved training
   */
   function addTraining(uint256 _schoolId, string memory _name, string memory _level, uint16 _duration, uint16 _validationThreshold) 
         external onlySchoolAdmin(_schoolId) schoolValidated(_schoolId) returns (uint256) {
      Training memory training;
      training.school = _schoolId;
      training.name = _name;
      training.level = _level;
      training.duration = _duration;
      training.validationThreshold = _validationThreshold;
      trainings.push(training);      

      uint256 id = trainings.length - 1;
      schools[_schoolId].trainings.push(id);
      emit TrainingAdded(_schoolId, id, _name, _level, _duration, _validationThreshold, msg.sender);

      return id;
   }


   /**
   * @notice Update a school's training 
   * @param _name       training name
   * @param _level      training level
   * @param _duration   training duration, in hours
   * @param _validationThreshold  number of validation by a jury to validate a user diploma
   * @param _juries     list of the jury
   */
   function updateTraining(uint256 _id, string memory _name, string memory _level, uint16 _duration, uint16 _validationThreshold, address[] memory _juries)
         external {
      Training storage training = trainings[_id];
      require(isSchoolAdmin(training.school), '!SchoolAdmin');
      training.name = _name;
      training.level = _level;
      training.duration = _duration;
      training.validationThreshold = _validationThreshold;

      emit TrainingUpdated(training.school, _id, _name, _level, _duration, _validationThreshold, msg.sender);

      for (uint256 i = 0; i < _juries.length; i++) {
         addJury(training.school, _id, _juries[i]);
      }
   }


   /**
   * @notice Returns training data
   * @param _id   id of training
   * @return name       training name
   * @return level      training level
   * @return duration   training duration, in hours
   * @return validationThreshold jury validation needed
   */
   function getTraining(uint256 _id) external view
         returns (string memory name, string memory level, uint16 duration, uint16 validationThreshold) {
      Training memory training = trainings[_id];

      return (training.name, training.level, training.duration, training.validationThreshold);
   }


   /**
   * @notice Get the number of juries for a training
   * @param _id   id of training
   * @return number of juries
   */
   function getTrainingNbJuries(uint256 _id) external view returns (uint256) {
      return trainingJuries[_id].length();
   }


   /**
   * @notice Get a jury for specified training
   * @param _id      id of training
   * @param _index   index of jury
   * @return address of jury
   */
   function getTrainingJury(uint256 _id, uint256 _index) external view returns (address) {
      return trainingJuries[_id].at(_index);
   }


   /**
   * @notice Add a jury to a training
   * @param _schoolId   id of the school
   * @param _trainingId if of the training
   * @param _jury       added jury
   */
   function addJury(uint256 _schoolId, uint256 _trainingId, address _jury) public onlySchoolAdmin(_schoolId) schoolValidated(_schoolId) /* TODO ?? */ {
      require(isRegistered(_jury), "Jury !registered");
      require(trainings[_trainingId].school == _schoolId, "Mismatched school");

      users[_jury].role |= VALIDATED_MASK;
      trainingJuries[_trainingId].add(_jury);
      userJuryTrainings[_jury].add(_trainingId);

      emit JuryAdded(_schoolId, _trainingId, _jury, msg.sender);
   }


   /**
   * @notice Remove a jury from a training
   * @param _trainingId id of the training
   * @param _jury       jury to remove
   */
   function removeJury(uint256 _trainingId, address _jury) external {
      Training storage training = trainings[_trainingId];
      require(isSchoolAdmin(training.school));

      trainingJuries[_trainingId].remove(_jury);
      userJuryTrainings[_jury].remove(_trainingId);

      emit JuryRemoved(training.school, _trainingId, _jury, msg.sender);
   }


   function createDiplomeNFT(address ownerAddressNFT, string memory hash) public returns(uint256){
      return nft.AddNFTToAdress(ownerAddressNFT, hash);
   }
   

   function getNFTAddress() public view returns(address){
      return address(nft);
   }
   

   function getlastUriId() public view returns(uint256){
        return nft.getlastUriId();
   }
    

   function createDiplomeNFTs(address ownerAddressNFT, string[] memory hashes) external returns(uint256){
        uint256 last;
        for(uint i =0;i < hashes.length;i++){
            last = createDiplomeNFT(ownerAddressNFT, hashes[i]);
        }
        
        return last;
    }
	
}
