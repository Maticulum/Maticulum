// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";

import "./IMaticulum.sol";
import "./MaticulumNFT.sol";


contract Maticulum is IMaticulum, Ownable {
   
   struct UserHash {
      string hash;
      uint8 role;
   }
   
   struct UserHashAdress {
      string hash;
      uint8 role;
      address userAdress;
   }
      

   uint8 constant SUPER_ADMIN_MASK = 0x80;
   uint8 constant VALIDATED_MASK = 0x02;
   uint8 constant REGISTERED_MASK = 0x01;

   address trainingContract;
   address payable feesReceiver;

   mapping(address => UserHash) public users;
   

   event UserCreated(address userAdress);

  
   modifier onlyRegistered() {
      require(users[msg.sender].role != 0, "!Registered");
      _;
   }


   constructor() {
      feesReceiver = payable(msg.sender);
   }

   /** register the address of the smart contract MaticulumTraining 
   * @param _trainingContract address of the smart contract 
   */
   function registerTrainingContract(address _trainingContract) external onlyOwner {
      trainingContract = _trainingContract;
   }

   /** check if the address of the user has superAdmin role or not
    * @param _user address of the user 
    */
   function isSuperAdmin(address _user) external view override returns (bool) {
      return (users[_user].role & SUPER_ADMIN_MASK) == SUPER_ADMIN_MASK;
   }

    
   /** check if the address of the user has is registered in the users array
    * @param _user address of the user
    */
   function isRegistered(address _user) external view override returns(bool) {
      return users[_user].role != 0;
   }

   /** get the fees of the receiever address
    */
   function getFeesReceiver() external view override returns (address payable) {
      return feesReceiver;
   }

    
   /** validate the user by setting his role to VALIDATED_MASK
    * @param _user address of the user
    */
   function validateUser(address _user) external override {
      require(msg.sender == trainingContract || msg.sender == owner(), "!owner|training");
      
      users[_user].role |= VALIDATED_MASK;
   }

   /** Validate the user by setting his role to SUPER_ADMIN_MASK
    * @param _userAdress address of the user
    */
   function setSuperAdmin(address _userAdress) external onlyOwner {
      users[_userAdress].role |= SUPER_ADMIN_MASK;
   }
   
   /** register a user with crypted datas and his role and address
    * @param _userAdress address of the user
    * @param _hash crypted datas of the user (name, firstname,country date, birth date, email, phone, mobile phone)
    * @param _role address of the user
    */
   function registerUserHash(address _userAdress, string memory _hash, uint8 _role) public {
      users[_userAdress] = UserHash(_hash, _role);
   }
   
   /** register a list of user with crypted datas and their role and address
    * @param _users contains a list of the addresses, the crypted datas and the role
    */
   function registerUsersHashes(UserHashAdress[] memory _users) external {
       for(uint i =0;i < _users.length;i++){
            registerUserHash(_users[i].userAdress, _users[i].hash, _users[i].role );
        } 
   }
   
   /** get user datas by user address 
    * @param _userAdress address of the user
    */
   function getUserHash(address _userAdress) external view returns(UserHash memory) {
      return users[_userAdress];
   }
   
   /** get user datas of the sender
    */
   function getUser() external view returns(UserHash memory) {
      return users[msg.sender];
   }
	

    /** set user role by passing user address
    * @param _userAddress address of the user
    * @param _role role of the user
    */
   function addUser(address _userAddress, uint8 _role) external onlyOwner {     
      users[_userAddress].role = _role;
   }

}