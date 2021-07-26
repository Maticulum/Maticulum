const { BN, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const Maticulum = artifacts.require('./Maticulum.sol');
const MaticulumSchool = artifacts.require('./MaticulumSchool.sol');
const MaticulumTraining = artifacts.require('./MaticulumTraining.sol');


contract('MaticulumTraining', accounts => {

   const superAdmin1 = accounts[0];
   const superAdmin2 = accounts[1];
   const schoolAdmin1 = accounts[2];
   const schoolAdmin2 = accounts[3];
   const jury1 = accounts[4];
   const jury2 = accounts[5];
   const student1 = accounts[6];
   const student2 = accounts[7];

   before(async () => {
      this.maticulum = await Maticulum.new();
      this.school = await MaticulumSchool.new(this.maticulum.address);
		this.training = await MaticulumTraining.new(this.maticulum.address, this.school.address);

      await this.maticulum.registerTrainingContract(this.training.address, { from: superAdmin1 });
      await this.school.registerTrainingContract(this.training.address, { from: superAdmin1 });

      await this.maticulum.addUser(superAdmin1, 0x83, { from: superAdmin1 });
      await this.maticulum.addUser(superAdmin2, 0x83, { from: superAdmin1 });
      await this.maticulum.addUser(schoolAdmin1, 0x03, { from: superAdmin1 });
      await this.maticulum.addUser(schoolAdmin2, 0x03, { from: superAdmin1 });
      await this.maticulum.addUser(jury1, 0x03, { from: superAdmin1 });
      await this.maticulum.addUser(jury2, 0x01, { from: superAdmin1 });
      await this.maticulum.addUser(student1, 0x01, { from: superAdmin1 });
      await this.maticulum.addUser(student2, 0x01, { from: superAdmin1 });

      await this.school.updateSchoolValidationThreshold(1, { from: superAdmin1 });
      await this.school.addSchool('Alyra', 'Paris', 'France', 2, schoolAdmin1, schoolAdmin2, { value: "100000000000000000", from: superAdmin1 });
      await this.school.validateSchool(0, { from: superAdmin1 });
	});	

  
   it("Add a training", async () => {
      await this.training.addTraining(0, "School 1", "Level 1", 0, 2, [ jury1, jury2 ], { from: schoolAdmin1 });

      const training = await this.training.trainings(0);

      expect(training.name).to.be.equal("School 1");
      expect(training.level).to.be.equal("Level 1");
      expect(training.duration).to.be.bignumber.equal(new BN(0));
      expect(training.validationThreshold).to.be.bignumber.equal(new BN(2));

      let isJury = await this.training.isJury(jury1);
      expect(isJury).to.be.true;

      isJury = await this.training.isJury(jury2);
      expect(isJury).to.be.true;

      const trainingCount = await this.training.getTrainingsCount();
      expect(trainingCount).to.be.bignumber.equal(new BN(1));

      const waitingJuriesCount = await this.training.getTrainingJuriesWaitingValidationCount(0);
      expect(waitingJuriesCount).to.be.bignumber.equal(new BN(2));
   });


   it("Validate jury", async () => {
      let waitingJuriesCount = await this.training.getTrainingJuriesWaitingValidationCount(0);
      expect(waitingJuriesCount).to.be.bignumber.equal(new BN(2));

      await this.training.validateJuryMultiple(0, [ jury1 ], { from: schoolAdmin2 });
      waitingJuriesCount = await this.training.getTrainingJuriesWaitingValidationCount(0);
      expect(waitingJuriesCount).to.be.bignumber.equal(new BN(1));

      await this.training.validateJuryMultiple(0, [ jury2 ], { from: schoolAdmin2 });
      waitingJuriesCount = await this.training.getTrainingJuriesWaitingValidationCount(0);
      expect(waitingJuriesCount).to.be.bignumber.equal(new BN(0));

      let isJury = await this.training.isTrainingJury(0, jury1);
      expect(isJury).to.be.true;

      isJury = await this.training.isTrainingJury(0, jury2);
      expect(isJury).to.be.true;
   });


   it("Validate diploma", async () => {
      checkValidation(student1, jury1, 0, false, false);

      await this.training.validateDiploma(0, student1, { from: jury1 });
      checkValidation(student1, jury1, 1, true, false);

      await this.training.validateDiploma(0, student1, { from: jury2 });
      checkValidation(student1, jury2, 2, true, true);
   });


   checkValidation = async (student, jury, expectedValidatedCount, expectedValidatedByJury, expectedValidated) => {
      const validation = await this.training.getDiplomaValidation(0, student, jury);
      const { validatedCount, validatedByJury, validated } = validation;

      expect(validatedCount).to.be.bignumber.equal(new BN(expectedValidatedCount));
      expect(validatedByJury).to.equals(expectedValidatedByJury);
      expect(validated).to.equals(expectedValidated);
   }


   it("Jury can only be validated by school admin", async () => {
      await this.training.addTraining(0, "School 1", "Level 1", 0, 2, [ jury1, jury2 ], { from: schoolAdmin1 });

      await expectRevert(this.training.validateJuryMultiple(1, [jury1], { from: student1 }), '!SchoolAdmin');
      await expectRevert(this.training.validateJuryMultiple(1, [jury1], { from: superAdmin1 }), '!SchoolAdmin');
   });


   it("Diploma can only be validated by jury", async () => {
      await expectRevert(this.training.validateDiploma(0, student1, { from: student2 }), '!jury');
      await expectRevert(this.training.validateDiploma(0, student1, { from: superAdmin1 }), '!jury');
   });
     
});
