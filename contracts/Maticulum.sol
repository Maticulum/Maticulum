// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;


contract Maticulum {
    
   struct User{
       string name;
       string firstname;
   }
   
   mapping(address => User) users;
   mapping(address => bool) userRegisterd;
   
   function register(string memory name, string memory firstname) external{
       require(!userRegisterd[msg.sender], "user already registered");
       userRegisterd[msg.sender] = true;
       users[msg.sender] = User(name, firstname);
   }
   
   function getUser() external view returns(User memory){
       require(userRegisterd[msg.sender], "user not registered");
       return users[msg.sender];
   }
   
   function updateUser(string memory name, string memory firstname) external{
       require(userRegisterd[msg.sender], "user not registered");
       users[msg.sender].name = name;
       users[msg.sender].firstname = firstname;
   }
}
