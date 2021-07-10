// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./MaticulumNFT.sol";

contract Maticulum is Ownable {
   
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
      address[] juries;      
   }
   

   uint8 constant SUPER_ADMIN_MASK = 0x80;
   uint8 constant ADMIN_MASK = 0x08;
   uint8 constant JURY_MASK = 0x04;
   uint8 constant STUDENT_MASK = 0x02;
   uint8 constant REGISTERED_MASK = 0x01;


   MaticulumNFT public nft;

   mapping(address => User) users;
   mapping(address => bool) userIsCreated;
   mapping(address => bool) userIsRegistered;
   address firstAdminUniveristy;
   bool hasAdmin;
   
   School[] schools;
   uint256 public schoolRegistrationFees = 0.1 ether;
   uint8 public schoolValidationThreshold = 2;
   
   Training[] trainings;
   mapping(uint256 => mapping(address => address[])) juryValidators;


   event UserCreated(address userAdress);
   
   event SchoolAdded(uint256 id, string name, string town, string country, address addedBy);
   event SchoolUpdated(uint256 id, string name, string town, string country, address updatedBy);
   event SchoolAdminAdded(uint256 id, address admin, address updatedBy);
   event SchoolValidationThresholdUpdated(uint8 validationThreshold, address updatedBy);
   event SchoolRegistrationFeesUpdated(uint256 registrationFees, address updatedBy);
   event SchoolValidated(uint256 id, string name, address validator, uint256 count);

   event TrainingAdded(uint256 schoolId, uint256 trainingId, string name, string level, uint16 duration, uint16 validationThreshold, address addedBy);
   event JuryAdded(uint256 schoolId, uint256 trainingId, address jury, address addedBy);
   event JuryValidated(uint256 schoolId, uint256 trainingId, address jury, address validator, uint16 count);
   

   modifier onlySuperAdmin() {
      require((users[msg.sender].role & SUPER_ADMIN_MASK) == SUPER_ADMIN_MASK, "!SuperAdmin");
      _;
   }

   modifier onlyAdmin() {
      require((users[msg.sender].role & ADMIN_MASK) == ADMIN_MASK, "!Admin");
      _;
   }

   modifier onlySchoolAdmin(uint256 id) {
      School memory school = schools[id];
      bool isSchoolAdmin = false;
      for (uint256 i = 0; i < school.administrators.length; i++) {
         if (school.administrators[i] == msg.sender) {
            isSchoolAdmin = true;
            break;
         }
      }
      require(isSchoolAdmin, "!SchoolAdmin");

      _;
   }

   modifier onlyJury() {
      require((users[msg.sender].role & JURY_MASK) == JURY_MASK, "!Jury");
      _;
   }

   modifier juryForTraining(address jury, uint256 id) {
      Training memory training = trainings[id];
      bool found = false;
      for (uint256 i = 0; i < training.juries.length; i++) {
         if (training.juries[i] == jury) {
            found = true;
            break;
         }
      }
      require(found, "!juryForTraining");

      _;
   }

   modifier onlyStudent() {
      require((users[msg.sender].role & STUDENT_MASK) == STUDENT_MASK, "!Student");
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


   function addSchoolAdministrator(uint256 _id, address _administrator) external onlyAdmin {
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
         returns(string memory name, string memory town, string memory country, address[] memory administrators, address[] memory validators) {
      School storage school = schools[_id];

      return (school.name, school.town, school.country, school.administrators, school.validators);
   }


   function isSchoolValidated(uint256 _id) public view returns (bool) {
      return schools[_id].validators.length >= schoolValidationThreshold;
   }


   function addTraining(uint256 _schoolId, string memory _name, string memory _level, uint16 _duration, uint16 _validationThreshold) 
         external onlySchoolAdmin(_schoolId) schoolValidated(_schoolId) returns (uint256) {
      Training memory training;
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


   function addJury(uint256 _schoolId, uint256 _trainingId, address _jury) external onlySchoolAdmin(_schoolId) schoolValidated(_schoolId) {
      require(isRegistered(_jury), "Jury !registered");

      trainings[_trainingId].juries.push(_jury);

      emit JuryAdded(_schoolId, _trainingId, _jury, msg.sender);
   }


   function validateJury(uint256 _schoolId, uint256 _trainingId, address _jury) 
         external onlySchoolAdmin(_schoolId) schoolValidated(_schoolId) juryForTraining(_jury, _trainingId) {
      
      for (uint16 i = 0; i < juryValidators[_trainingId][_jury].length; i++) {
         if (juryValidators[_trainingId][_jury][i] == msg.sender) {
               revert("Already validated by this user.");
         }
      }

      juryValidators[_trainingId][_jury].push(msg.sender);

      if (isJuryValidated(_trainingId, _jury)) {
         users[_jury].role |= JURY_MASK;
      }

      uint256 length = juryValidators[_trainingId][_jury].length;
      emit JuryValidated(_schoolId, _trainingId, _jury, msg.sender, uint16(length));
   }


   function isJuryValidated(uint256 _trainingId, address _jury) public view returns (bool) {
      return juryValidators[_trainingId][_jury].length >= trainings[_trainingId].validationThreshold;
   }


   function createDiplomeNFT(address ownerAddressNFT, string memory hash) external returns(uint256){
      return nft.AddNFTToAdress(ownerAddressNFT, hash);
   }


   // TODO For testing purposes, should be removed
   function forceRole(uint8 role) external onlyOwner {
      users[msg.sender].role = role;
   }

}
