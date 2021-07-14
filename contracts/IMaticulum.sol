// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;


interface IMaticulum {

   function isSuperAdmin(address _user) external view returns (bool);
   
   function isRegistered(address _user) external view returns (bool);

   function validateUser(address _user) external;

}