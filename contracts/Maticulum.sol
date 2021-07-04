// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;


contract Maticulum {
    
   struct User{
       string name;
       string firstname;
   }
   
   mapping(address => User) Users;
   
   function Register(string memory name, string memory firstname) external{
       Users[msg.sender] = User(name, firstname);
   }
   
   function GetUser() external view returns( User memory){
       return Users[msg.sender];
   }
}