## `MaticulumTraining`






### `constructor(address _maticulum, address _school)` (public)





### `isJury(address _user) → bool` (external)

Check if a user is a jury of a training




### `getTrainingsCount() → uint256` (external)

Get the number of trainings




### `getDiplomasReadyCount() → uint256` (external)

Get the number of diplomas ready




### `getRegistrationStatus(uint256 _trainingId, address _user) → bool registered, bool validated` (external)

Get the status of a registration request




### `validateUserTrainingRequestDirect(uint256 _trainingId, address _user)` (external)

Register for a training




### `getUserTrainings(address _user) → uint256[]` (external)

Get the training list for a user




### `addTraining(uint256 _schoolId, string _name, string _level, uint16 _duration, uint16 _validationThreshold, address[] _juries) → uint256` (external)

Registers a school's training 




### `updateTraining(uint256 _trainingId, string _name, string _level, uint16 _duration, uint16 _validationThreshold, address[] _addJuries, address[] _removeJuries)` (external)

Update a school's training 




### `getTrainingJuries(uint256 _id) → address[]` (external)

Get a jury for specified training




### `getTrainingsForJury(address _jury) → uint256[]` (external)

Get the trainingId list of a jury




### `addJury(uint256 _trainingId, address _jury)` (internal)

Add a jury to a training, waiting validation according to training validation threshold




### `getTrainingJuriesWaitingValidation(uint256 _trainingId) → address[]` (external)

Get the juries waiting a validation for a given training




### `getTrainingsWaitingValidationForJury(address _jury) → uint256[]` (external)

Get the trainings for a given jury waiting a validation 




### `validateJury(uint256 _trainingId, address _jury)` (internal)

Validate a jury




### `validateJuryMultiple(uint256 _trainingId, address[] _juries)` (external)

Validate multiple juries




### `getJuryValidationStatus(uint256 _trainingId, address _jury) → bool validated, uint256 count` (external)

Get the status of a jury validation




### `getJuryValidator(uint256 _trainingId, address _jury, uint256 _index) → address` (external)

Get the address who validates this jury, for the given training and index


count can be retrieve with getJuryValidationStatus


### `removeJury(uint256 _trainingId, address _jury)` (internal)

Remove a jury from a training




### `getUsersCountForTraining(uint256 _trainingId) → uint256` (external)

Get the number of users for a training.




### `getUserForTraining(uint256 _trainingId, uint256 _index) → address` (external)

Get the Nth userId of a training




### `getUsersForTraining(uint256 _trainingId) → address[]` (external)





### `validateDiploma(uint256 _trainingId, address _user)` (public)

Validates a diploma for a user




### `validateDiplomaMultipleUsers(uint256 _trainingId, address[] _users)` (external)





### `getDiplomaValidation(uint256 _trainingId, address _user, address _jury) → uint256 validatedCount, bool validatedByJury, bool validated` (external)

Get informations about the validation of a user diploma




### `isTrainingJury(uint256 _trainingId, address _user) → bool` (public)

Check that a user belongs to the jury of given training




### `addUserTraining(address _user, uint256 _trainingId)` (external)



For test purposes, should be removed

### `diplomaValidated(address _userAddress, uint256 _trainingId) → bool` (public)






### `TrainingAdded(uint256 schoolId, uint256 trainingId, string name, string level, uint16 duration, uint16 validationThreshold, address addedBy)`





### `TrainingUpdated(uint256 schoolId, uint256 trainingId, string name, string level, uint16 duration, uint16 validationThreshold, address updatedBy)`





### `JuryAdded(uint256 trainingId, address jury, address addedBy)`





### `JuryValidated(uint256 trainingId, address jury, uint256 count, address validatedBy)`





### `JuryRemoved(uint256 trainingId, address jury, address removedBy)`





### `UserTrainingRequest(uint256 trainingId, address requestedBy)`





### `UserTrainingRequestValidation(uint256 trainingId, address user, address validatedBy)`





### `ValidateDiploma(uint256 trainingId, address user, uint256 count, address validatedBy)`





