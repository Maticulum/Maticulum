// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "./Owner.sol";

contract Maticulum is Owner {
    
   enum role{
       adminUniversity,
       jury,
       student
   } 
   
   struct user{
       string name;
       string firstname;
       string matricule;
       role userRole;
   }
   
   struct School {
        string name;
        address[] validators;
    }
   
   struct data{
       string name;
       string firstname;
   }
   
   struct userData{
       user userInfo;
       address userAddress;
   }
   
   mapping(address => user) Users;
   mapping(address => bool) UserRegistered;
   
   School[] public schools;
   uint256[] schoolsToValidate;
   
   event SchoolAdded(uint256 id, string name);
   event SchoolUpdated(uint256 id, string name);
   event SchoolValidated(uint256 id, string name, address validator, uint256 count);
   
   function whitelist(address userAddress) external isOwner{
       UserRegistered[userAddress] = true;
       Users[userAddress] = user('','','', role.adminUniversity);
   }
   
   function whitelistByAdmin(address userAddress, role userRole) external{
       require(UserRegistered[msg.sender], "user not registered");
       user memory u = Users[msg.sender];
       require(u.userRole == role.adminUniversity, "user not registered");
       UserRegistered[userAddress] = true;
       Users[userAddress] = user('','','', userRole);
   }
   
   function whitelistByAdmin(userData[] memory userDatas) external{
       for (uint i=0; i<userDatas.length; i++) {
            userData memory u = userDatas[i];
            Users[u.userAddress] = user('','',u.userInfo.matricule,u.userInfo.userRole);
            UserRegistered[u.userAddress] = true;
        }
   }
   
   function userModifications(string memory name, string memory firstname) external{
       require(UserRegistered[msg.sender], "user not registered");
       Users[msg.sender].name = name;
       Users[msg.sender].firstname = firstname;
   }
   
   function getUser() external view returns(user memory){
       require(UserRegistered[msg.sender], "user not registered");
       return Users[msg.sender];
   }
   
   function isRegistered() external view returns(bool){
       return UserRegistered[msg.sender];
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