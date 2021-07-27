// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IDiplomasValidation.sol";
import "./MaticulumTraining.sol";
import "./ISchool.sol";

contract DiplomasValidation is IDiplomasValidation, Ownable {
    
    constructor(address schoolAddress, address trainingAddress){
        school = ISchool(schoolAddress);
        training = MaticulumTraining(trainingAddress);
    }
    
    ISchool school;
    MaticulumTraining training;
    
     /*
    * @param _schoolId         adress of the future owner of the NFT
   * @param _trainingId       id of the student's training
   * @param _userAddresses    list of student adresses who will have a diploma
    */
    function areDiplomasValidated(address schoolAdmin, uint256 _schoolId, uint256 _trainingId, address[] memory _userAddresses) public view override returns (bool) {
        
        
        require(school.isSchoolAdmin(_schoolId, schoolAdmin), "!SchoolAdmin");
        
        for(uint i =0;i < _userAddresses.length;i++){
            require(training.diplomaValidated(_userAddresses[i], _trainingId), "!DiplomaValidated");
        } 
        
        return true;
    }
    
}