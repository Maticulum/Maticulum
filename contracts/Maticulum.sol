// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;


contract Maticulum {
    
   struct User{
       string name;
       string firstname;
   }

    struct School {
        string name;
        address[] validators;
    }
   
   mapping(address => User) Users;
   mapping(address => bool) UserRegistered;

    School[] schools;
    uint256[] schoolsToValidate;


    event SchoolAdded(uint256 id, string name);
    event SchoolUpdated(uint256 id, string name);
    event SchoolValidated(uint256 id, string name, address validator, uint256 count);

   
   function Register(string memory name, string memory firstname) external{
       require(!UserRegistered[msg.sender], "user already registered");
       UserRegistered[msg.sender] = true;
       Users[msg.sender] = User(name, firstname);
   }
   
   function GetUser() external view returns( User memory){
       require(UserRegistered[msg.sender], "user not registered");
       return Users[msg.sender];
   }
   
   function UpdateUser(string memory name, string memory firstname) external{
       require(UserRegistered[msg.sender], "user not registered");
       Users[msg.sender].name = name;
       Users[msg.sender].firstname = firstname;
   }
   
   function isRegistered() external view returns(bool){
       return UserRegistered[msg.sender];
   }


    function addSchool(string memory _name) external /* only(Admin) */ {
        School memory school;
        school.name = _name;

        schools.push(school);

        uint256 id = schools.length - 1;
        schoolsToValidate.push(id);
        
        emit SchoolAdded(id, _name);
    }


    function updateSchool(uint256 _id, string memory _name) external /* only(Admin) */ {
        School storage school = schools[_id];
        school.name = _name;
        delete school.validators;

        schoolsToValidate.push(_id);

        emit SchoolUpdated(_id, _name);
    }


    function validateSchool(uint256 _id) external /* only(Admin) */ {
        School storage school = schools[_id];
        
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


    function getSchoolsWaitingValidation() external view /* only(Admin) */ returns (School[] memory needValidation) {
        for (uint256 i = 0; i < schoolsToValidate.length; i++) {
            needValidation[i] = schools[schoolsToValidate[i]];
        }
    }

}
