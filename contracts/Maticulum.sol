// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

import "./IMaticulum.sol";
import "./MaticulumNFT.sol";


contract Maticulum is IMaticulum, Ownable {

   using EnumerableSet for EnumerableSet.UintSet;
   using EnumerableSet for EnumerableSet.AddressSet;
   

   struct User {
      string name;
      string firstname;
      string birthCountry;
      string birthDate;
      string matricule;
      string mail;
      string mobile;
      string telfixe;
      uint8 role;
   }
   
   struct UserHash {
      string hash;
      uint8 role;
   }
      

   uint8 constant SUPER_ADMIN_MASK = 0x80;
   uint8 constant VALIDATED_MASK = 0x02;
   uint8 constant REGISTERED_MASK = 0x01;

   MaticulumNFT public nft;
   address trainingContract;
   address payable feesReceiver;


   mapping(address => UserHash) public users;
   address firstAdminUniveristy;
   bool hasAdmin;
   

   event UserCreated(address userAdress);

  
   modifier onlyRegistered() {
      require(users[msg.sender].role != 0, "!Registered");
      _;
   }


   constructor(address _nft) {
      nft = MaticulumNFT(_nft);
      feesReceiver = payable(msg.sender);
   }


   function registerTrainingContract(address _trainingContract) external onlyOwner {
      trainingContract = _trainingContract;
   }


   function isSuperAdmin(address _user) external view override returns (bool) {
      return (users[_user].role & SUPER_ADMIN_MASK) == SUPER_ADMIN_MASK;
   }


   function isRegistered(address _user) external view override returns(bool) {
      return users[_user].role != 0;
   }


   function getFeesReceiver() external view override returns (address payable) {
      return feesReceiver;
   }


   function validateUser(address _user) external override {
      require(msg.sender == trainingContract || msg.sender == owner(), "!owner|training");
      
      users[_user].role |= VALIDATED_MASK;
   }


   function setSuperAdmin(address userAdress) external onlyOwner {
      users[userAdress].role |= SUPER_ADMIN_MASK;
   }
   
   function registerUserHash(address userAdress, string memory hash, uint8 _role) external {
      users[userAdress] = UserHash(hash, _role);
   }
   
   function getUserHash(address userAdress) external view returns(UserHash memory) {
      return users[userAdress];
   }
   

   function getUser() external view returns(UserHash memory) {
      return users[msg.sender];
   }
	

	/// @dev For test purposes, should be removed
   function addUser(address _user, uint8 _role) external onlyOwner {     
      users[_user].role = _role;
   }

}