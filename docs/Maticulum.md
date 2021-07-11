## `Maticulum`





### `onlySuperAdmin()`





### `onlySchoolAdmin(uint256 _id)`





### `onlyRegistered()`





### `schoolValidated(uint256 id)`






### `setSuperAdmin(address userAdress)` (external)





### `registerUser(string name, string firstname, string birthCountry, string birthDate, string mail, string telfixe, string mobile)` (external)





### `updateUser(string name, string firstname, string birthCountry, string birthDate, string mail, string telfixe, string mobile)` (public)





### `getUser() → struct Maticulum.User` (external)





### `isRegistered() → bool` (external)





### `isRegistered(address _user) → bool` (public)





### `isSchoolAdmin(uint256 _id) → bool` (public)

Checks that a user is admin of a given school




### `isTrainingJury(uint256 _id) → bool` (public)

Check that a user is jury of given training




### `addSchool(string _name, string _town, string _country, address _admin1, address _admin2) → uint256` (external)





### `addSchoolAdministrator(uint256 _id, address _administrator)` (external)





### `updateSchool(uint256 _id, string _name, string _town, string _country)` (external)





### `updateSchoolValidationThreshold(uint8 _validationThreshold)` (external)





### `updateSchoolRegistrationFees(uint256 _registrationFees)` (external)





### `validateSchool(uint256 _id)` (external)





### `getNbSchools() → uint256 length` (external)





### `getSchool(uint256 _id) → string name, string town, string country, address[] administrators, address[] validators, uint256[] _trainings` (external)





### `isSchoolValidated(uint256 _id) → bool` (public)





### `addTraining(uint256 _schoolId, string _name, string _level, uint16 _duration, uint16 _validationThreshold) → uint256` (external)

Registers a school's training 




### `updateTraining(uint256 _id, string _name, string _level, uint16 _duration, uint16 _validationThreshold, address[] _juries)` (external)

Update a school's training 




### `getTraining(uint256 _id) → string name, string level, uint16 duration, uint16 validationThreshold` (external)

Returns training data




### `getTrainingNbJuries(uint256 _id) → uint256` (external)

Get the number of juries for a training




### `getTrainingJury(uint256 _id, uint256 _index) → address` (external)

Get a jury for specified training




### `addJury(uint256 _schoolId, uint256 _trainingId, address _jury)` (public)

Add a jury to a training




### `removeJury(uint256 _trainingId, address _jury)` (external)

Remove a jury from a training




### `createDiplomeNFT(address ownerAddressNFT, string hash) → uint256` (public)





### `getNFTAddress() → address` (public)





### `getlastUriId() → uint256` (public)





### `createDiplomeNFTs(address ownerAddressNFT, string[] hashes) → uint256` (external)






### `UserCreated(address userAdress)`





### `SchoolAdded(uint256 id, string name, string town, string country, address addedBy)`





### `SchoolUpdated(uint256 id, string name, string town, string country, address updatedBy)`





### `SchoolAdminAdded(uint256 id, address admin, address updatedBy)`





### `SchoolValidationThresholdUpdated(uint8 validationThreshold, address updatedBy)`





### `SchoolRegistrationFeesUpdated(uint256 registrationFees, address updatedBy)`





### `SchoolValidated(uint256 id, string name, address validator, uint256 count)`





### `TrainingAdded(uint256 schoolId, uint256 trainingId, string name, string level, uint16 duration, uint16 validationThreshold, address addedBy)`





### `TrainingUpdated(uint256 schoolId, uint256 trainingId, string name, string level, uint16 duration, uint16 validationThreshold, address updatedBy)`





### `JuryAdded(uint256 schoolId, uint256 trainingId, address jury, address addedBy)`





### `JuryRemoved(uint256 schoolId, uint256 trainingId, address jury, address removedBy)`





### `JuryValidated(uint256 schoolId, uint256 trainingId, address jury, address validator, uint16 count)`





