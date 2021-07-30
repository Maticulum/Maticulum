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
      let adminCount = await this.school.getSchoolAdministratorsWaitingValidationCount(0);
      expect(adminCount).to.be.bignumber.equal(new BN(2));

      await this.school.validateAdministratorMultiple(0, [ schoolAdmin1 ], { from: superAdmin1 });
      adminCount = await this.school.getSchoolAdministratorsWaitingValidationCount(0);
      expect(adminCount).to.be.bignumber.equal(new BN(2));
      admins = await this.school.getSchoolAdministrators(0);
      expect(admins.length).to.be.bignumber.equal(new BN(0));

      await this.school.validateAdministratorMultiple(0, [ schoolAdmin1 ], { from: superAdmin2 });
      adminCount = await this.school.getSchoolAdministratorsWaitingValidationCount(0);
      expect(adminCount).to.be.bignumber.equal(new BN(1));
      admins = await this.school.getSchoolAdministrators(0);
      expect(admins.length).to.be.bignumber.equal(new BN(1));

      await this.school.validateAdministratorMultiple(0, [ schoolAdmin2 ], { from: superAdmin1 });
      adminCount = await this.school.getSchoolAdministratorsWaitingValidationCount(0);
      expect(adminCount).to.be.bignumber.equal(new BN(1));
      admins = await this.school.getSchoolAdministrators(0);
      expect(admins.length).to.be.bignumber.equal(new BN(1));

      await this.school.validateAdministratorMultiple(0, [ schoolAdmin2 ], { from: superAdmin2 });
      adminCount = await this.school.getSchoolAdministratorsWaitingValidationCount(0);
      expect(adminCount).to.be.bignumber.equal(new BN(0));
      admins = await this.school.getSchoolAdministrators(0);
      expect(admins.length).to.be.bignumber.equal(new BN(2));

      let isSchoolAdmin = await this.school.isSchoolAdmin(0, schoolAdmin1);
      expect(isSchoolAdmin).to.be.true;

      isSchoolAdmin = await this.school.isSchoolAdmin(0, schoolAdmin2);
      expect(isSchoolAdmin).to.be.true;
   });
   

   it("Only superAdmin can validate schoolAdmin", async () => {
      await expectRevert(this.school.validateAdministratorMultiple(0, [ schoolAdmin1 ], { from: student1 }), '!SuperAdmin');
      await expectRevert(this.school.validateAdministratorMultiple(0, [ schoolAdmin1 ], { from: schoolAdmin1 }), '!SuperAdmin');
   });

});
