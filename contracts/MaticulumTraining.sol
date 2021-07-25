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

   struct DiplomaValidation {
      EnumerableSet.AddressSet juries;
      bool validated;
   }

   struct DiplomaReady {
      uint256 trainingId;
      address user;
   }


   IMaticulum private maticulum;
   ISchool private school;

   /// List of trainings
   Training[] public trainings;

   /// List of (training, user) validated by juries and ready to emit diploma
   DiplomaReady[] public diplomasReady;

   /// List of (training, jury) waiting a validation from School Admin
   mapping(uint256 => EnumerableSet.AddressSet) trainingJuriesWaitingValidation;
   mapping(address => EnumerableSet.UintSet) juryWaitingTrainingValidation;

   /// List of (training, jury) validated by School Admin
   mapping(uint256 => EnumerableSet.AddressSet) trainingJuries;
   mapping(address => EnumerableSet.UintSet) juryTrainings;

   /// List of (training, student) waiting validation after registration to a training
   mapping(uint256 => EnumerableSet.AddressSet) trainingUsersWaitingValidation;
   mapping(address => EnumerableSet.UintSet) userWaitingTrainingValidation;

   /// List of validated (training, student)
   mapping(uint256 => EnumerableSet.AddressSet) trainingUsers;
   mapping(address => EnumerableSet.UintSet) userTrainings;
   
   /// List of validators for a (training, jury)
   mapping(uint256 => mapping(address => EnumerableSet.AddressSet)) juryValidations;

   /// List of jury validation for (training, student)
   mapping(uint256 => mapping(address => DiplomaValidation)) diplomaUserValidations;

   /// List of student date registration for a training
   mapping(uint256 => mapping(address => uint256)) public trainingStudentRegistrationDates;


   event TrainingAdded(uint256 schoolId, uint256 trainingId, string name, string level, uint16 duration, uint16 validationThreshold, address addedBy);
   event TrainingUpdated(uint256 schoolId, uint256 trainingId, string name, string level, uint16 duration, uint16 validationThreshold, address updatedBy);

   event JuryAdded(uint256 trainingId, address jury, address addedBy);
   event JuryValidated(uint256 trainingId, address jury, uint256 count, address validatedBy);
   event JuryRemoved(uint256 trainingId, address jury, address removedBy);

   event UserTrainingRequest(uint256 trainingId, address requestedBy);
   event UserTrainingRequestValidation(uint256 trainingId, address user, address validatedBy);

   event ValidateDiploma(uint256 trainingId, address user, uint256 count, address validatedBy);


   constructor(address _maticulum, address _school) {
      maticulum = IMaticulum(_maticulum);
      school = ISchool(_school);
   }


   /**
   * @notice Check if a user is a jury of a training
   * @param _user    address of the user
   * @return true if the user is a jury (even if not validated yet)
   */
   function isJury(address _user) external view returns (bool) {
      return juryTrainings[_user].length() > 0
         || juryWaitingTrainingValidation[_user].length() > 0;
   }


   /**
   * @notice Get the number of trainings
   * @return trainings count
   */
   function getTrainingsCount() external view returns (uint256) {
      return trainings.length;
   }


   /**
   * @notice Get the number of diplomas ready
   * @return diplomas ready count
   */
   function getDiplomasReadyCount() external view returns (uint256) {
      return diplomasReady.length;
   }

   /**
   * @notice Get the status of a registration request
   * @param _trainingId id of training
   * @param _user       user address
   * @return registered    true if the user has register for this training
   * @return validated     true if the request is validated
   */
   function getRegistrationStatus(uint256 _trainingId, address _user) external view returns (bool registered, bool validated) {
      validated = trainingUsers[_trainingId].contains(_user);
      registered = validated || trainingUsersWaitingValidation[_trainingId].contains(_user);
   }

   /**
   * @notice Register for a training
   * @param _trainingId id of training
   */
   function registerForTraining(uint256 _trainingId) external {
      require(maticulum.isRegistered(msg.sender), "!Registered");
      require(!userWaitingTrainingValidation[msg.sender].contains(_trainingId), "Already registered");

      trainingUsersWaitingValidation[_trainingId].add(msg.sender);
      userWaitingTrainingValidation[msg.sender].add(_trainingId);

      trainingStudentRegistrationDates[_trainingId][msg.sender] = block.timestamp; // TODO here or at validation step ?

      emit UserTrainingRequest(_trainingId, msg.sender);
   }
   

   function validateUserTrainingRequestDirect(uint256 _trainingId, address _user) external {
      require(school.isSchoolAdmin(trainings[_trainingId].school, msg.sender), "!SchoolAdmin");
      require(!userTrainings[_user].contains(_trainingId), "Already validated");
      
      userTrainings[_user].add(_trainingId);
      trainingUsers[_trainingId].add(_user);

      trainingStudentRegistrationDates[_trainingId][_user] = block.timestamp;


      emit UserTrainingRequestValidation(_trainingId, _user, msg.sender);
   }


   /**
   * @notice Valide the user request to register for a training
   * @param _trainingId id of the training
   * @param _user       address of user
   */
   function validateUserTrainingRequest(uint256 _trainingId, address _user) public {
      require(school.isSchoolAdmin(trainings[_trainingId].school, msg.sender), "!SchoolAdmin");
      require(userWaitingTrainingValidation[_user].contains(_trainingId), "Training !Registered");
      require(!userTrainings[_user].contains(_trainingId), "Already validated");

      userTrainings[_user].add(_trainingId);
      trainingUsers[_trainingId].add(_user);

      trainingUsersWaitingValidation[_trainingId].remove(_user);
      userWaitingTrainingValidation[_user].remove(_trainingId);

      emit UserTrainingRequestValidation(_trainingId, _user, msg.sender);
   }


   /**
   * @notice Validate multiple users request to register for a training
   * @param _trainingId id of the training
   * @param _users      array of users addresses
   */
   function validateUserTrainingRequestMultiple(uint256 _trainingId, address[] memory _users) external {
      for (uint256 i = 0; i < _users.length; i++) {
         validateUserTrainingRequest(_trainingId, _users[i]);
      }
   }


   /**
   * @notice Get the number of users who have request a registration for the given training
   * @param _trainingId    id of training
   * @return Count of users
   */
   function getUserWaitingTrainingValidationCount(uint256 _trainingId) external view returns (uint256) {
      return trainingUsersWaitingValidation[_trainingId].length();
   }


   /**
   * @notice Get the user waiting registration for the given training and index
   * @param _trainingId    id of training
   * @param _index         index of user
   * @return User address at this index
   */
   function getUserWaitingTrainingValidation(uint256 _trainingId, uint256 _index) external view returns (address) {
      return trainingUsersWaitingValidation[_trainingId].at(_index);
   }
   

   /**
   * @notice Get the number of trainings a user is waiting for registration validation
   * @param _user    address of user
   * @return Count of trainings
   */
   function getTrainingsUserWaitingValidationCount(address _user) external view returns (uint256) {
      return userWaitingTrainingValidation[_user].length();
   }


   /**
   * @notice Get the training a user is waiting for registration validation for the given index
   * @param _user    address of user
   * @param _index   training index
   * @return Training at this index
   */
   function getTrainingUserWaitingValidation(address _user, uint256 _index) external view returns (uint256) {
      return userWaitingTrainingValidation[_user].at(_index);
   }


   /**
   * @notice Get the number of trainings for a user
   * @param _user    address of user
   * @return Count of trainings
   */
   function getUserTrainingsCount(address _user) external view returns (uint256) {
      return userTrainings[_user].length();
   }


   /**
   * @notice Get the training for a user for the given index
   * @param _user    address of user
   * @param _index   training index
   * @return Training at this index
   */
   function getUserTraining(address _user, uint256 _index) external view returns (uint256) {
      return userTrainings[_user].at(_index);
   }


   /**
   * @notice Registers a school's training 
   * @param _schoolId   id of the school
   * @param _name       training name
   * @param _level      training level
   * @param _duration   training duration, in hours
   * @param _validationThreshold  number of validation by a jury to validate a user diploma
   * @param _juries     juries for the training
   * @return the id of the saved training
   */
   function addTraining(uint256 _schoolId, string memory _name, string memory _level, uint16 _duration, uint16 _validationThreshold, address[] memory _juries) 
         external returns (uint256) {
      require(school.isSchoolAdmin(_schoolId, msg.sender), "!SchoolAdmin");
      require(school.isValidated(_schoolId), "!SchoolValidated");

      trainings.push(Training(_schoolId, _name, _level, _duration, _validationThreshold));      

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
   * @param _trainingId id of training
   * @param _name       training name
   * @param _level      training level
   * @param _duration   training duration, in hours
   * @param _validationThreshold  number of validation by a jury to validate a user diploma
   * @param _addJuries  list of the juries to add
   * @param _removeJuries  list of the juries to remove
   */
   function updateTraining(uint256 _trainingId, string memory _name, string memory _level, uint16 _duration, uint16 _validationThreshold, 
         address[] memory _addJuries, address[] memory _removeJuries)
         external {
      Training storage training = trainings[_trainingId];
      require(school.isSchoolAdmin(training.school, msg.sender), '!SchoolAdmin');
      training.name = _name;
      training.level = _level;
      training.duration = _duration;
      training.validationThreshold = _validationThreshold;

      emit TrainingUpdated(training.school, _trainingId, _name, _level, _duration, _validationThreshold, msg.sender);

      for (uint256 i = 0; i < _addJuries.length; i++) {
         addJury(_trainingId, _addJuries[i]);
      }
      for (uint256 i = 0; i < _removeJuries.length; i++) {
         removeJury(_trainingId, _removeJuries[i]);
      }
   }


   /**
   * @notice Get the number of juries for a training
   * @param _id   id of training
   * @return number of juries
   */
   function getTrainingJuriesCount(uint256 _id) external view returns (uint256) {
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
   * @notice Get the number of trainings a jury participates in.
   * @param _jury jurys address
   * @return jury's training count
   */
   function getTrainingsCountForJury(address _jury) external view returns (uint256) {
      return juryTrainings[_jury].length();
   }


   /**
   * @notice Get the Nth trainingId of the jury
   * @param _jury jurys address
   * @param _index   index in the jury's training list
   * @return the training id
   */
   function getTrainingForJury(address _jury, uint256 _index) external view returns (uint256) {
      return juryTrainings[_jury].at(_index);
   }


   /**
   * @notice Add a jury to a training, waiting validation according to training validation threshold
   * @param _trainingId if of the training
   * @param _jury       added jury
   */
   function addJury(uint256 _trainingId, address _jury) internal {
      require(school.isSchoolAdmin(trainings[_trainingId].school, msg.sender));
      require(maticulum.isRegistered(_jury), "Jury !registered");
      require(!trainingJuriesWaitingValidation[_trainingId].contains(_jury), "Already waiting");
      require(!trainingJuries[_trainingId].contains(_jury), "Already jury");

      trainingJuriesWaitingValidation[_trainingId].add(_jury);
      juryWaitingTrainingValidation[_jury].add(_trainingId);

      emit JuryAdded(_trainingId, _jury, msg.sender);

      validateJury(_trainingId, _jury);
   }


   /**
   * @notice Get the count of juries waiting a validation for a given training
   * @param _trainingId id of the training
   * @return 
   */
   function getTrainingJuriesWaitingValidationCount(uint256 _trainingId) external view returns (uint256) {
      return trainingJuriesWaitingValidation[_trainingId].length();
   }


   /**
   * @notice Get the jury waiting a validation for a given training and index
   * @param _trainingId id of the training
   * @param _index      element index
   * @return jury
   */
   function getTrainingJuryWaitingValidation(uint256 _trainingId, uint256 _index) external view returns (address) {
      return trainingJuriesWaitingValidation[_trainingId].at(_index);
   }


   function getTrainingsWaitingValidationCountForJury(address _jury) external view returns (uint256) {
      return juryWaitingTrainingValidation[_jury].length();
   }


   function getTrainingWaitingValidationForJury(address _jury, uint256 index) external view returns (uint256) {
      return juryWaitingTrainingValidation[_jury].at(index);
   }


   /**
   * @notice Validate a jury
   * @param _trainingId id of training
   * @param _jury       address of jury
   */
   function validateJury(uint256 _trainingId, address _jury) internal {
      require(trainingJuriesWaitingValidation[_trainingId].contains(_jury), "Not waiting");
      require(!trainingJuries[_trainingId].contains(_jury), "Already jury");
      require(!juryValidations[_trainingId][_jury].contains(msg.sender), "Already validated by this admin");
      
      juryValidations[_trainingId][_jury].add(msg.sender);

      uint256 count = juryValidations[_trainingId][_jury].length();
      if (count >= trainings[_trainingId].validationThreshold) {
         maticulum.validateUser(_jury);
         trainingJuries[_trainingId].add(_jury);
         juryTrainings[_jury].add(_trainingId);

         trainingJuriesWaitingValidation[_trainingId].remove(_jury);
         juryWaitingTrainingValidation[_jury].remove(_trainingId);
      }

      emit JuryValidated(_trainingId, _jury, count, msg.sender);
   }


   /**
   * @notice Validate multiple juries
   * @param _trainingId    id of training
   * @param _juries        juries to validate
   */
   function validateJuryMultiple(uint256 _trainingId, address[] memory _juries) external {
      require(school.isSchoolAdmin(trainings[_trainingId].school, msg.sender));

      for (uint256 i = 0; i < _juries.length; i++) {
         validateJury(_trainingId, _juries[i]);
      }
   }


   /**
   * @notice Get the status of a jury validation
   * @param _trainingId    id of training
   * @param _jury          jury address
   * @return validated     true if the jury is validated
   * @return count         nb of school admins who have validated this jury
   */
   function getJuryValidationStatus(uint256 _trainingId, address _jury) external view returns (bool validated, uint256 count) {
      count = juryValidations[_trainingId][_jury].length();
      validated = count >= trainings[_trainingId].validationThreshold;
   }


   /**
   * @notice Get the address who validates this jury, for the given training and index
   * @dev count can be retrieve with getJuryValidationStatus
   * @param _trainingId    id of training
   * @param _jury          jury address
   * @param _index         index of validator
   * @return the address
   */
   function getJuryValidator(uint256 _trainingId, address _jury, uint256 _index) external view returns (address) {
      return juryValidations[_trainingId][_jury].at(_index);
   }


   /**
   * @notice Remove a jury from a training
   * @param _trainingId id of the training
   * @param _jury       jury to remove
   */
   function removeJury(uint256 _trainingId, address _jury) internal {
      require(school.isSchoolAdmin(trainings[_trainingId].school, msg.sender));

      trainingJuries[_trainingId].remove(_jury);
      juryTrainings[_jury].remove(_trainingId);

      emit JuryRemoved(_trainingId, _jury, msg.sender);
   }


   /**
   * @notice Get the number of users for a training.
   * @param _trainingId    id of training
   * @return trainings number
   */
   function getUsersCountForTraining(uint256 _trainingId) external view returns (uint256) {
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
   * @notice Validates a diploma for a user
   * @param _trainingId    id of training
   * @param _user          user address
   */
   function validateDiploma(uint256 _trainingId, address _user) public {
      require(isTrainingJury(_trainingId, msg.sender), "!jury");
      require(block.timestamp >= trainingStudentRegistrationDates[_trainingId][_user] + (trainings[_trainingId].duration * 3600 ), "StillOngoingTraining");

      DiplomaValidation storage validation = diplomaUserValidations[_trainingId][_user];
      validation.juries.add(msg.sender);

      uint256 count = validation.juries.length();
      if (count >= trainings[_trainingId].validationThreshold) {
         validation.validated = true;
         diplomasReady.push(DiplomaReady(_trainingId, _user));
      }

      emit ValidateDiploma(_trainingId, _user, count, msg.sender);
   }


   /*
   * @notice Validates a diploma for multiple users in a single transaction
   * @param _trainingId    id of training
   * @param _users         list of user addresses
   */
   function validateDiplomaMultipleUsers(uint256 _trainingId, address[] memory _users) external {
      require(isTrainingJury(_trainingId, msg.sender), "!jury");

      for (uint256 i = 0; i < _users.length; i++) {
         validateDiploma(_trainingId, _users[i]);
      }
   }


   /**
   * @notice Get informations about the validation of a user diploma
   * @param _trainingId    id of training
   * @param _user          user address
   * @param _jury          jury address
   * @return validatedCount  juries already validated count
   * @return validatedByJury true if this jury as validated the training/user
   * @return validated       true if all needed juries have validated the training/user
   */
   function getDiplomaValidation(uint256 _trainingId, address _user, address _jury) 
         external view returns (uint256 validatedCount, bool validatedByJury, bool validated) {
      DiplomaValidation storage validation = diplomaUserValidations[_trainingId][_user];

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
   function addUserTraining(address _user, uint256 _trainingId) external onlyOwner {
      userTrainings[_user].add(_trainingId);
      trainingUsers[_trainingId].add(_user);

      trainingStudentRegistrationDates[_trainingId][_user] = block.timestamp;
   }

}
