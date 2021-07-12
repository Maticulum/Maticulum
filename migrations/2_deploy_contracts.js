var Maticulum = artifacts.require("./Maticulum.sol");

module.exports = async (deployer, network, accounts) => {
   await deployer.deploy(Maticulum);
   const instance = await Maticulum.deployed();

   if (network === 'develop') {
      console.log('---=== Adding test data ===---');

      const superAdmin = accounts[0];
      const schoolAdmin = accounts[1];
      const jury = accounts[2];
      const student1 = accounts[3];
      const student2 = accounts[4];

      await instance.registerUser('ADMIN 1', 'Super', 'France', '10/07/2021', 'a@a.com', '123', '123');
      await instance.setSuperAdmin(superAdmin);

      await instance.addUser(schoolAdmin, 0x03);
      await instance.addUser(jury, 0x03);
      await instance.addUser(student1, 0x01);
      await instance.addUser(student2, 0x01);

      await instance.updateSchoolValidationThreshold(1);

      await instance.addSchool('Alyra', 'Paris', 'France', superAdmin, schoolAdmin);
      await instance.validateSchool(0);
   }
};
