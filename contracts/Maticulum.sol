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

    School[] public schools;
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
   
   function isRegistered() external view returns (bool){
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
