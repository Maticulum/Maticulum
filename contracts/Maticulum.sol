// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;


contract Maticulum {
    
   struct User{
       string name;
       string firstname;
   }
   
   mapping(address => User) Users;
   mapping(address => bool) UserRegistered;
   
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
}
