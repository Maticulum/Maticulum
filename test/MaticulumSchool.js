const { BN, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const Maticulum = artifacts.require('./Maticulum.sol');
const MaticulumSchool = artifacts.require('./MaticulumSchool.sol');
const MaticulumTraining = artifacts.require('./MaticulumTraining.sol');


contract('MaticulumSchool', accounts => {

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
	});	

  
   it("Add a school", async () => {
      await this.school.addSchool('Alyra', 'Paris', 'France', 2, schoolAdmin1, schoolAdmin2, { value: "100000000000000000", from: schoolAdmin1 });
      
      const school = await this.school.schools(0);
      expect(school.name).to.be.equal("Alyra");
      expect(school.town).to.be.equal("Paris");
      expect(school.country).to.be.equal("France");
   });


   it("Validate admin", async () => {
      let waitings = await this.school.getSchoolAdministratorsWaitingValidation(0);
      checkAddresses(waitings, 2, [ schoolAdmin1, schoolAdmin2]);

      await this.school.validateAdministratorMultiple(0, [ schoolAdmin1 ], { from: superAdmin1 });
      waitings = await this.school.getSchoolAdministratorsWaitingValidation(0);
      checkAddresses(waitings, 2, [ schoolAdmin1, schoolAdmin2]);
      admins = await this.school.getSchoolAdministrators(0);
      checkAddresses(admins, 0, []);

      await this.school.validateAdministratorMultiple(0, [ schoolAdmin1 ], { from: superAdmin2 });
      waitings = await this.school.getSchoolAdministratorsWaitingValidation(0);
      checkAddresses(waitings, 1, [ schoolAdmin2 ]);
      admins = await this.school.getSchoolAdministrators(0);
      checkAddresses(admins, 1, [ schoolAdmin1]);

      await this.school.validateAdministratorMultiple(0, [ schoolAdmin2 ], { from: superAdmin1 });
      waitings = await this.school.getSchoolAdministratorsWaitingValidation(0);
      checkAddresses(waitings, 1, [ schoolAdmin2]);
      admins = await this.school.getSchoolAdministrators(0);
      checkAddresses(admins, 1, [ schoolAdmin1]);

      await this.school.validateAdministratorMultiple(0, [ schoolAdmin2 ], { from: superAdmin2 });
      waitings = await this.school.getSchoolAdministratorsWaitingValidation(0);
      checkAddresses(waitings, 0, []);
      admins = await this.school.getSchoolAdministrators(0);
      checkAddresses(admins, 2, [ schoolAdmin1, schoolAdmin2]);

      let isSchoolAdmin = await this.school.isSchoolAdmin(0, schoolAdmin1);
      expect(isSchoolAdmin).to.be.true;

      isSchoolAdmin = await this.school.isSchoolAdmin(0, schoolAdmin2);
      expect(isSchoolAdmin).to.be.true;
   });


   checkAddresses = (values, size, content) => {
      expect(values.length).to.be.equal(size);

      for (let i = 0; i < size; i++) {
         expect(values[i]).to.be.equal(content[i]);
      }
   }
   

   it("Check admin validators", async () => {
      let validators = await this.school.getAdminValidators(0, schoolAdmin1);
      checkAddresses(validators, 2, [ superAdmin1, superAdmin2 ]);

      validators = await this.school.getAdminValidators(0, schoolAdmin2);
      checkAddresses(validators, 2, [ superAdmin1, superAdmin2 ]);
   });


   it("Update a school", async () => {
      await this.school.updateSchool(0, 'Harvard', 'Cambridge', 'USA', 2, { from: schoolAdmin1 });

      const school = await this.school.schools(0);
      expect(school.name).to.be.equal("Harvard");
      expect(school.town).to.be.equal("Cambridge");
      expect(school.country).to.be.equal("USA");
   });


   it("Only superAdmin can call updateSchoolValidationThreshold", async () => {
      await expectRevert(this.school.updateSchoolValidationThreshold(0, { from: student1 }), "!SuperAdmin");
      await expectRevert(this.school.updateSchoolValidationThreshold(0, { from: jury1 }), "!SuperAdmin");
      await expectRevert(this.school.updateSchoolValidationThreshold(0, { from: schoolAdmin1 }), "!SuperAdmin");
   });


   it("Only superAdmin can call updateSchoolRegistrationFees", async () => {
      await expectRevert(this.school.updateSchoolRegistrationFees(0, { from: student1 }), "!SuperAdmin");
      await expectRevert(this.school.updateSchoolRegistrationFees(0, { from: jury1 }), "!SuperAdmin");
      await expectRevert(this.school.updateSchoolRegistrationFees(0, { from: schoolAdmin1 }), "!SuperAdmin");
   });


   it("Fees should be provided when adding a school", async () => {
      await expectRevert(this.school.addSchool('Alyra', 'Paris', 'France', 2, schoolAdmin1, schoolAdmin2, { value: "10000000000000000", from: jury1 }), "MissingFees");
      await expectRevert(this.school.addSchool('Alyra', 'Paris', 'France', 2, schoolAdmin1, schoolAdmin2, { from: student1 }), "MissingFees");
   });


   it("Only a schoolAdmin can update a school", async () => {
      await expectRevert(this.school.updateSchool(0, 'A', 'B', 'C', 0, { from: student1 }), '!SchoolAdmin');
      await expectRevert(this.school.updateSchool(0, 'A', 'B', 'C', 0, { from: student1 }), '!SchoolAdmin');
      await expectRevert(this.school.updateSchool(0, 'A', 'B', 'C', 0, { from: student1 }), '!SchoolAdmin');
   });


   it("Only superAdmin can validate schoolAdmin", async () => {
      await expectRevert(this.school.validateAdministratorMultiple(0, [ schoolAdmin1 ], { from: student1 }), '!SuperAdmin');
      await expectRevert(this.school.validateAdministratorMultiple(0, [ schoolAdmin1 ], { from: schoolAdmin1 }), '!SuperAdmin');
   });

});
