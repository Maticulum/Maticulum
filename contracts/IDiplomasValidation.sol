// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

interface IDiplomasValidation{
    function areDiplomasValidated(uint256 _schoolId, uint256 _trainingId, address[] memory _userAddresses) external view returns(bool);
}