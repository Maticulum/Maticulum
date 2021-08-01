## `MaticulumSchool`





### `onlySuperAdmin()`





### `onlyRegistered()`






### `constructor(address _maticulum)` (public)





### `registerTrainingContract(address _trainingContract)` (external)





### `isSchoolAdmin(uint256 _schoolId, address _user) → bool` (external)

Checks that a user is admin of a given school




### `_isSchoolAdmin(uint256 _schoolId, address _user) → bool` (internal)



Duplicate of above function, needed as override function must be external...

### `getJuryValidationThreshold(uint256 _schoolId) → uint8` (external)

Get the number of juries needed to validate a training registration


This value is common for all the trainings in a school


### `addSchool(string _name, string _town, string _country, uint8 _juryValidationThreshold, address _admin1, address _admin2)` (external)

Add a new school


2 admins must be provided at creation


### `updateSchool(uint256 _schoolId, string _name, string _town, string _country, uint8 _juryValidationThreshold)` (external)

Update a school




### `addSchoolAdministrator(uint256 _schoolId, address _user)` (public)

Add a school admin for a specified school




### `validateAdministrator(uint256 _schoolId, address _user)` (internal)

Validate an administrator (By a Maticulum admin). Require schoolValidationThreshold validations.




### `validateAdministratorMultiple(uint256 _schoolId, address[] _users)` (external)

Validate multiple administrators




### `updateSchoolValidationThreshold(uint8 _validationThreshold)` (external)

Update the number of Maticulum admins needed to validate a school admin




### `updateSchoolRegistrationFees(uint256 _registrationFees)` (external)

Update the school registration fees




### `getSchoolsCount() → uint256` (external)

Get the number of schools




### `getSchoolAdministrators(uint256 _schoolId) → address[]` (external)

Get the admins list for a given school




### `getSchoolAdministratorsWaitingValidation(uint256 _schoolId) → address[]` (external)

Get the admins list waiting validation for a given school




### `getAdministratorSchools(address _admin) → uint256[]` (external)

Get the schools for a given admin and index




### `getAdminValidationStatus(uint256 _schoolId, address _admin) → bool validated, uint256 count` (external)

Get the status of an admin validation




### `getAdminValidators(uint256 _schoolId, address _admin) → address[]` (external)

Get the address who validates this admin, for the given school




### `getSchoolTrainings(uint256 _schoolId) → uint256[]` (external)

Get trainings list for specified school




### `linkTraining(uint256 _schoolId, uint256 _trainingId)` (external)

link a training to a school


this function is only accessible to Training smartcontract



### `SchoolAdded(uint256 schoolId, string name, string town, string country, uint8 juryValidationThreshold, address addedBy)`





### `SchoolUpdated(uint256 schoolId, string name, string town, string country, uint8 juryValidationThreshold, address updatedBy)`





### `SchoolAdminAdded(uint256 schoolId, address admin, address updatedBy)`





### `SchoolAdminValidated(uint256 schoolId, address admin, uint256 count, address updatedBy)`





### `SchoolValidationThresholdUpdated(uint8 validationThreshold, address updatedBy)`





### `SchoolRegistrationFeesUpdated(uint256 registrationFees, address updatedBy)`





