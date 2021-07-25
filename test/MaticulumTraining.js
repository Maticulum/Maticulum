const { BN, ether, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const MaticulumNFT = artifacts.require('./MaticulumNFT.sol');
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

   beforeEach(async () => {
      this.nft = await MaticulumNFT.new("", "", "", "", "", "", "", "", "");
      this.maticulum = await Maticulum.new(this.nft.address);
      this.school = await MaticulumSchool.new(this.maticulum.address);
		this.training = await MaticulumTraining.new(this.maticulum.address, this.school.address);

      await this.nft.transferOwnership(this.maticulum.address);

      await this.maticulum.registerTrainingContract(this.training.address, { from: superAdmin1 });
      await this.school.registerTrainingContract(this.training.address, { from: superAdmin1 });

      await this.maticulum.addUser(superAdmin1, "A", "A", 0x83, { from: superAdmin1 });
      await this.maticulum.addUser(superAdmin2, "B", "B", 0x83, { from: superAdmin1 });
      await this.maticulum.addUser(schoolAdmin1, "C", "C", 0x03, { from: superAdmin1 });
      await this.maticulum.addUser(schoolAdmin2, "D", "D", 0x03, { from: superAdmin1 });
      await this.maticulum.addUser(jury1, "E", "E", 0x03, { from: superAdmin1 });
      await this.maticulum.addUser(jury2, "F", "F", 0x01, { from: superAdmin1 });
      await this.maticulum.addUser(student1, "G", "G", 0x01, { from: superAdmin1 });
      await this.maticulum.addUser(student2, "H", "H", 0x01, { from: superAdmin1 });
	});	

  
   it("Nominal case", async () => {
      const isRegistered = await this.maticulum.isRegistered(superAdmin1);
	   console.log(isRegistered);

      assert.equal(isRegistered, true, "Is registered");
   });
  
});
