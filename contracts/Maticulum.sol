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
      bool isAdmin;
   }
   
   struct School {
      string name;
      address[] validators;
   }
   

   MaticulumNFT nft;

   mapping(address => User) users;
   mapping(address => bool) userIsCreated;
   mapping(address => bool) userIsRegistered;
   address firstAdminUniveristy;
   bool hasAdmin;
   
   School[] public schools;
   uint8 schoolValidationThreshold = 2;
   
   event UserCreated(address userAdress);
   
   event SchoolAdded(uint256 id, string name, address updatedBy);
   event SchoolUpdated(uint256 id, string name, address updatedBy);
   event SchoolValidationThresholdUpdated(uint8 threshold, address updatedBy);
   event SchoolValidated(uint256 id, string name, address validator, uint256 count);
   

   constructor() {
      nft = new MaticulumNFT();
   }


   function setUserAdmin(address userAdress) external onlyOwner {
      users[userAdress].isAdmin = true;
   }
   

   function registerUser(string memory name, string memory firstname, string memory birthCountry, string memory birthDate,
         string memory mail, string memory telfixe, string memory mobile) external {
      userIsCreated[msg.sender] = true;
      updateUser(name, firstname,mail, telfixe, mobile, birthCountry, birthDate);
   }
   

   function updateUser(string memory name, string memory firstname, string memory birthCountry, string memory birthDate,
         string memory mail, string memory telfixe, string memory mobile) public{
      require(userIsCreated[msg.sender], "user not created");
      users[msg.sender].name = name;
      users[msg.sender].firstname = firstname;
      users[msg.sender].birthCountry = birthCountry;
      users[msg.sender].birthDate = birthDate;
      users[msg.sender].mail = mail;
      users[msg.sender].telfixe = telfixe;
      users[msg.sender].mobile = mobile;
   }
   

   function getUser() external view returns(User memory){
      require(userIsCreated[msg.sender], "user not created");
      return users[msg.sender];
   }
   

   function isRegistered() external view returns(bool){
      return userIsCreated[msg.sender];
   }
   

   function addSchool(string memory _name) external /* only(Admin) */ returns (uint256) {
      address[] memory validators = new address[](1);
      validators[0] = msg.sender;
      schools.push(School(_name, validators));

      uint256 id = schools.length - 1;
      
      emit SchoolAdded(id, _name, msg.sender);
      return id;
   }


   function updateSchool(uint256 _id, string memory _name) external /* only(Admin) */ {
      School storage school = schools[_id];
      school.name = _name;
      delete school.validators;
      school.validators.push(msg.sender);

      emit SchoolUpdated(_id, _name, msg.sender);
   }


   function updateSchoolValidationThreshold(uint8 _validationThreshold) external /* only superadmin */ {
      schoolValidationThreshold = _validationThreshold;

      emit SchoolValidationThresholdUpdated(_validationThreshold, msg.sender);
   }


   function validateSchool(uint256 _id) external /* only(Admin) */ {
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


   function getSchool(uint256 _id) external view returns (string memory name, address[] memory validators) {
      School storage school = schools[_id];

      return (school.name, school.validators);
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