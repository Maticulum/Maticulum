// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;


contract Maticulum {
    
   struct User{
       string name;
       string firstname;
   }
   
   mapping(address => User) Users;
   mapping(address => bool) UserRegisterd;
   
   function Register(string memory name, string memory firstname) external{
       require(!UserRegisterd[msg.sender], "user already registered");
       UserRegisterd[msg.sender] = true;
       Users[msg.sender] = User(name, firstname);
   }
   
   function GetUser() external view returns( User memory){
       require(UserRegisterd[msg.sender], "user not registered");
       return Users[msg.sender];
   }
   
   function UpdateUser(string memory name, string memory firstname) external{
       require(UserRegisterd[msg.sender], "user not registered");
       Users[msg.sender].name = name;
       Users[msg.sender].firstname = firstname;
   }
}