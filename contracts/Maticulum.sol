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
      

   uint8 constant SUPER_ADMIN_MASK = 0x80;
   uint8 constant VALIDATED_MASK = 0x02;
   uint8 constant REGISTERED_MASK = 0x01;

   MaticulumNFT public nft;
   address trainingContract;
   address feesReceiver;


   mapping(address => User) public users;
   mapping(address => string) userHash;
   address firstAdminUniveristy;
   bool hasAdmin;
   

   event UserCreated(address userAdress);

  
   modifier onlyRegistered() {
      require(users[msg.sender].role != 0, "!Registered");
      _;
   }


   constructor(address _nft) {
      nft = MaticulumNFT(_nft);
      feesReceiver = msg.sender;
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


   function validateUser(address _user) external override {
      require(msg.sender == trainingContract || msg.sender == owner(), "!owner|training");
      
      users[_user].role |= VALIDATED_MASK;
   }


   function setSuperAdmin(address userAdress) external onlyOwner {
      users[userAdress].role |= SUPER_ADMIN_MASK;
   }
   
   function registerUserHash(address userAdress, string memory hash) external {
      userHash[userAdress] = hash;
   }
   
   function getUserHash(address userAdress) external view returns(string memory) {
      return userHash[userAdress];
   }
   

   function registerUser(string memory name, string memory firstname, string memory birthCountry, string memory birthDate,
         string memory mail, string memory telfixe, string memory mobile) external {
      users[msg.sender].role = REGISTERED_MASK;
      updateUser(name, firstname,mail, telfixe, mobile, birthCountry, birthDate);
   }
   

   function updateUser(string memory name, string memory firstname, string memory birthCountry, string memory birthDate,
         string memory mail, string memory telfixe, string memory mobile) 
         public
         onlyRegistered {
      users[msg.sender].name = name;
      users[msg.sender].firstname = firstname;
      users[msg.sender].birthCountry = birthCountry;
      users[msg.sender].birthDate = birthDate;
      users[msg.sender].mail = mail;
      users[msg.sender].telfixe = telfixe;
      users[msg.sender].mobile = mobile;
   }
   

   function getUser() external view returns(User memory) {
      return users[msg.sender];
   }
   

   function getlastUriId() public view returns(uint256){
        return nft.getlastUriId();
   }


   function createDiplomeNFTs(address ownerAddressNFT, string[] memory hashes) external returns(uint256){
        return nft.AddNFTsToAdress(ownerAddressNFT, hashes);
   }
	

	/// @dev For test purposes, should be removed
   function addUser(address _user, string memory _firstname, string memory _lastname, uint8 _role) external onlyOwner {
      users[_user].firstname = _firstname;
      users[_user].name = _lastname;      
      users[_user].role = _role;
   }

}