// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "./Owner.sol";

contract Maticulum is Owner {
  
   struct user{
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
   
   mapping(address => user) Users;
   mapping(address => bool) UserIsCreated;
   mapping(address => bool) UserIsRegistered;
   address firstAdminUniveristy;
   bool hasAdmin;
   
   School[] public schools;
   uint256[] schoolsToValidate;
   
   event UserCreated(address userAdress);
   
   event SchoolAdded(uint256 id, string name);
   event SchoolUpdated(uint256 id, string name);
   event SchoolValidated(uint256 id, string name, address validator, uint256 count);
   
   function setUserAdmin(address userAdress) external isOwner{
       Users[userAdress].isAdmin = true;
   }
   
   function userRegister(string memory name, string memory firstname, string memory birthCountry, string memory birthDate,
   string memory mail, string memory telfixe, string memory mobile) external {
       UserIsCreated[msg.sender] = true;
       userUpdate(name, firstname,mail, telfixe, mobile, birthCountry, birthDate);
   }
   
   function userUpdate(string memory name, string memory firstname, string memory birthCountry, string memory birthDate,
   string memory mail, string memory telfixe, string memory mobile) public{
       require(UserIsCreated[msg.sender], "user not created");
       Users[msg.sender].name = name;
       Users[msg.sender].firstname = firstname;
       Users[msg.sender].birthCountry = birthCountry;
       Users[msg.sender].birthDate = birthDate;
       Users[msg.sender].mail = mail;
       Users[msg.sender].telfixe = telfixe;
       Users[msg.sender].mobile = mobile;
    }
   
   function getUser() external view returns(user memory){
       require(UserIsCreated[msg.sender], "user not created");
       return Users[msg.sender];
   }
   
   function isRegistered() external view returns(bool){
       return UserIsCreated[msg.sender];
   }
   
   function addSchool(string memory _name) external /* only(Admin) */ returns (uint256) {
        address[] memory validators = new address[](1);
        validators[0] = msg.sender;
        schools.push(School(_name, validators));

        uint256 id = schools.length - 1;
        schoolsToValidate.push(id);
        
        emit SchoolAdded(id, _name);
        return id;
    }


    function updateSchool(uint256 _id, string memory _name) external /* only(Admin) */ {
        School storage school = schools[_id];
        school.name = _name;
        delete school.validators;
        school.validators.push(msg.sender);

        schoolsToValidate.push(_id);

        emit SchoolUpdated(_id, _name);
    }


    function validateSchool(uint256 _id) external /* only(Admin) */ {
        School storage school = schools[_id];

        for (uint256 i = 0; i < school.validators.length; i++) {
            if (school.validators[i] == msg.sender) {
                revert("Already validated by this user.");
            }
        }
        
        school.validators.push(msg.sender);
        if (school.validators.length >= 3) {
            for (uint256 i = 0; i < schoolsToValidate.length; i++) {
                if (schoolsToValidate[i] == _id) {
                    schoolsToValidate[i] = schoolsToValidate[schoolsToValidate.length - 1];
                    schoolsToValidate.pop();
                    break;
                }
            }
        }
        
        emit SchoolValidated(_id, school.name, msg.sender, school.validators.length);
    }


    function getNbSchools() external view returns (uint256 length) {
        return schools.length;
    }


    function getSchool(uint256 _id) external view returns (string memory name, address[] memory validators) {
        School storage school = schools[_id];

        return (school.name, school.validators);
    }


    function getSchoolsWaitingValidation() external view /* only(Admin) */ returns (School[] memory needValidation) {
        for (uint256 i = 0; i < schoolsToValidate.length; i++) {
            needValidation[i] = schools[schoolsToValidate[i]];
        }
    }
}