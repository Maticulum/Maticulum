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
   }

   struct Training {
      uint256 school;
      string name;
      string level;
      uint16 duration;
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
   
   School[] public schools;
   uint256 schoolRegistrationFees = 0.1 ether;
   uint8 schoolValidationThreshold = 2;
   
   event UserCreated(address userAdress);
   
   event SchoolAdded(uint256 id, string name, string town, string country, address addedBy);
   event SchoolUpdated(uint256 id, string name, string town, string country, address updatedBy);
   event SchoolAdminAdded(uint256 id, address admin, address updatedBy);
   event SchoolValidationThresholdUpdated(uint8 validationThreshold, address updatedBy);
   event SchoolRegistrationFeesUpdated(uint256 registrationFees, address updatedBy);
   event SchoolValidated(uint256 id, string name, address validator, uint256 count);
   

   modifier onlySuperAdmin() {
      require((users[msg.sender].role & ~SUPER_ADMIN_MASK) != 0, "!SuperAdmin");
      _;
   }

   modifier onlyAdmin() {
      require((users[msg.sender].role & ~ADMIN_MASK) != 0, "!Admin");
      _;
   }

   modifier onlyJury() {
      require((users[msg.sender].role & ~JURY_MASK) != 0, "!Jury");
      _;
   }

   modifier onlyStudent() {
      require((users[msg.sender].role & ~STUDENT_MASK) != 0, "!Student");
      _;
   }

   modifier onlyRegistered() {
      require(users[msg.sender].role != 0, "!Registered");
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
      return users[msg.sender].role != 0;
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


   function updateSchool(uint256 _id, string memory _name, string memory _town, string memory _country) external onlyAdmin {
      // TODO require only admin of this school
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


   function isSchoolValidated(uint256 _id) public view returns (bool) {
      return schools[_id].validators.length >= schoolValidationThreshold;
   }
   

   function createDiplomeNFT(address ownerAddressNFT, string memory hash) external returns(uint256){
      return nft.AddNFTToAdress(ownerAddressNFT, hash);
   }
   
   function getNFTAddress() public view returns(address){
      return address(nft);
   }
   
   function getlastUriId() public view returns(uint256){
        return nft.getlastUriId();
    }
}
