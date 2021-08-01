## `Maticulum`





### `onlyRegistered()`






### `registerTrainingContract(address _trainingContract)` (external)

register the address of the smart contract MaticulumTraining 




### `isSuperAdmin(address _user) → bool` (external)

check if the address of the user has superAdmin role or not




### `isRegistered(address _user) → bool` (external)

check if the address of the user has is registered in the users array




### `getFeesReceiver() → address payable` (external)

get the fees of the receiever address



### `validateUser(address _user)` (external)

validate the user by setting his role to VALIDATED_MASK




### `setSuperAdmin(address _userAdress)` (external)

Validate the user by setting his role to SUPER_ADMIN_MASK




### `registerUserHash(address _userAdress, string _hash, uint8 _role)` (public)

register a user with crypted datas and his role and address




### `registerUsersHashes(struct Maticulum.UserHashAdress[] _users)` (external)

register a list of user with crypted datas and their role and address




### `getUserHash(address _userAdress) → struct Maticulum.UserHash` (external)

get user datas by user address 




### `getUser() → struct Maticulum.UserHash` (external)

get user datas of the sender



### `addUser(address _userAddress, uint8 _role)` (external)

set user role by passing user address





### `UserCreated(address userAdress)`





