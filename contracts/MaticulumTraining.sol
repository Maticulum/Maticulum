// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

import "./IMaticulum.sol";
import "./ISchool.sol";


contract MaticulumTraining is Ownable {

   using EnumerableSet for EnumerableSet.UintSet;
   using EnumerableSet for EnumerableSet.AddressSet;


   struct Training {
      uint256 school;
      string name;
      string level;
      uint16 duration;
      uint16 validationThreshold;
   }

   struct TrainingValidation {
      EnumerableSet.AddressSet juries;
      bool validated;
   }


   IMaticulum private maticulum;
   ISchool private school;

   Training[] public trainings;   
   mapping(uint256 => EnumerableSet.AddressSet) trainingJuries;
   mapping(address => EnumerableSet.UintSet) userJuryTrainings;
   mapping(uint256 => EnumerableSet.AddressSet) trainingUsers;
   mapping(address => EnumerableSet.UintSet) userTrainings;
   
   mapping(uint256 => mapping(address => TrainingValidation)) trainingUserValidation;


   event TrainingAdded(uint256 schoolId, uint256 trainingId, string name, string level, uint16 duration, uint16 validationThreshold, address addedBy);
   event TrainingUpdated(uint256 schoolId, uint256 trainingId, string name, string level, uint16 duration, uint16 validationThreshold, address updatedBy);

   event JuryAdded(uint256 schoolId, uint256 trainingId, address jury, address addedBy);
   event JuryRemoved(uint256 schoolId, uint256 trainingId, address jury, address removedBy);
   event JuryValidated(uint256 schoolId, uint256 trainingId, address jury, address validator, uint16 count);


   constructor(address _school) {
      school = ISchool(_school);
   }


   /**
   * @notice Registers a school's training 
   * @param _schoolId   id of the school
   * @param _name       training name
   * @param _level      training level
   * @param _duration   training duration, in hours
   * @param _validationThreshold  number of validation by a jury to validate a user diploma
   * @param _juries     juryies for the training
   * @return the id of the saved training
   */
   function addTraining(uint256 _schoolId, string memory _name, string memory _level, uint16 _duration, uint16 _validationThreshold, address[] memory _juries) 
         external returns (uint256) {
      require(school.isSchoolAdmin(_schoolId, msg.sender), "!SchoolAdmin");
      require(school.isValidated(_schoolId), "!SchoolValidated");

      Training memory training;
      training.school = _schoolId;
      training.name = _name;
      training.level = _level;
      training.duration = _duration;
      training.validationThreshold = _validationThreshold;
      trainings.push(training);      

      uint256 id = trainings.length - 1;
      school.linkTraining(_schoolId, id);

      emit TrainingAdded(_schoolId, id, _name, _level, _duration, _validationThreshold, msg.sender);

      for (uint256 i = 0; i < _juries.length; i++) {
         addJury(id, _juries[i]);
      }

      return id;
   }


   /**
   * @notice Update a school's training 
   * @param _name       training name
   * @param _level      training level
   * @param _duration   training duration, in hours
   * @param _validationThreshold  number of validation by a jury to validate a user diploma
   * @param _addJuries  list of the juries to add
   * @param _removeJuries  list of the juries to remove
   */
   function updateTraining(uint256 _id, string memory _name, string memory _level, uint16 _duration, uint16 _validationThreshold, 
         address[] memory _addJuries, address[] memory _removeJuries)
         external {
      Training storage training = trainings[_id];
      require(school.isSchoolAdmin(training.school, msg.sender), '!SchoolAdmin');
      training.name = _name;
      training.level = _level;
      training.duration = _duration;
      training.validationThreshold = _validationThreshold;

      emit TrainingUpdated(training.school, _id, _name, _level, _duration, _validationThreshold, msg.sender);

      for (uint256 i = 0; i < _addJuries.length; i++) {
         addJury(_id, _addJuries[i]);
      }
      for (uint256 i = 0; i < _removeJuries.length; i++) {
         removeJury(_id, _removeJuries[i]);
      }
   }


   /**
   * @notice Get the number of juries for a training
   * @param _id   id of training
   * @return number of juries
   */
   function getTrainingNbJuries(uint256 _id) external view returns (uint256) {
      return trainingJuries[_id].length();
   }


   /**
   * @notice Get a jury for specified training
   * @param _id      id of training
   * @param _index   index of jury's list
   * @return address of jury
   */
   function getTrainingJury(uint256 _id, uint256 _index) external view returns (address) {
      return trainingJuries[_id].at(_index);
   }


   /**
   * @notice Get the number of trainings a jury participate in.
   * @param _jury jurys address
   * @return jury's training count
   */
   function getTrainingsNbForJury(address _jury) external view returns (uint256) {
      return userJuryTrainings[_jury].length();
   }


   /**
   * @notice Get the Nth trainingId of the jury
   * @param _jury jurys address
   * @param _index   index in the jury's training list
   * @return the training id
   */
   function getTrainingForJury(address _jury, uint256 _index) external view returns (uint256) {
      return userJuryTrainings[_jury].at(_index);
   }


   /**
   * @notice Add a jury to a training
   * @param _trainingId if of the training
   * @param _jury       added jury
   */
   function addJury(uint256 _trainingId, address _jury) internal {
      require(maticulum.isRegistered(_jury), "Jury !registered");

      require(school.isSchoolAdmin(trainings[_trainingId].school, msg.sender));

      maticulum.validateUser(_jury);
      trainingJuries[_trainingId].add(_jury);
      userJuryTrainings[_jury].add(_trainingId);

      emit JuryAdded(trainings[_trainingId].school, _trainingId, _jury, msg.sender);
   }


   /**
   * @notice Remove a jury from a training
   * @param _trainingId id of the training
   * @param _jury       jury to remove
   */
   function removeJury(uint256 _trainingId, address _jury) internal {
      Training storage training = trainings[_trainingId];
      require(school.isSchoolAdmin(training.school, msg.sender));

      trainingJuries[_trainingId].remove(_jury);
      userJuryTrainings[_jury].remove(_trainingId);

      emit JuryRemoved(training.school, _trainingId, _jury, msg.sender);
   }


   /**
   * @notice Get the number of users for a training.
   * @param _trainingId    id of training
   * @return trainings number
   */
   function getUsersNbForTraining(uint256 _trainingId) external view returns (uint256) {
      return trainingUsers[_trainingId].length();
   }


   /**
   * @notice Get the Nth userId of a training
   * @param _trainingId    id of training
   * @param _index         index in the users list
   * @return the user address
   */
   function getUserForTraining(uint256 _trainingId, uint256 _index) external view returns (address) {
      return trainingUsers[_trainingId].at(_index);
   }
   

   /**
   * @notice Validates a training for a user
   * @param _trainingId    id of training
   * @param _user          user address
   */
   function validateTraining(uint256 _trainingId, address _user) public {
      require(isTrainingJury(_trainingId, msg.sender), "!jury");

      TrainingValidation storage validation = trainingUserValidation[_trainingId][_user];
      validation.juries.add(msg.sender);

      if (validation.juries.length() >= trainings[_trainingId].validationThreshold) {
         validation.validated = true;
      }
   }


   /*
   * @notice Validates a training for multiple users in a single transaction
   * @param _trainingId    id of training
   * @param _users         list of user addresses
   */
   function validateTrainingMultipleUsers(uint256 _trainingId, address[] memory _users) external {
      require(isTrainingJury(_trainingId, msg.sender), "!jury");

      for (uint256 i = 0; i < _users.length; i++) {
         validateTraining(_trainingId, _users[i]);
      }
   }


   /**
   * @notice Get informations about the validation of a user training
   * @param _trainingId    id of training
   * @param _user          user address
   * @param _jury          jury address
   * @return validatedCount  juries already validated
   * @return validatedByJury true if this jury as validated the training/user
   * @return validated       true if all needed juries have validated the training/user
   */
   function getTrainingValidation(uint256 _trainingId, address _user, address _jury) 
         external view returns (uint256 validatedCount, bool validatedByJury, bool validated) {
      TrainingValidation storage validation = trainingUserValidation[_trainingId][_user];

      return (validation.juries.length(), validation.juries.contains(_jury), validation.validated);
   }


   /**
   * @notice Check that a user belongs to the jury of given training
   * @param _trainingId   id of the training
   * @param _user          user address
   * @return true if user is a jury of the training
   */
   function isTrainingJury(uint _trainingId, address _user) public view returns (bool) {
      return trainingJuries[_trainingId].contains(_user);
   }


   /// @dev For test purposes, should be removed
   function addUserTraining(address _user, uint256 _trainingId) external {
      userTrainings[_user].add(_trainingId);
      trainingUsers[_trainingId].add(_user);
   }

}
