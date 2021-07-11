var Maticulum = artifacts.require("./Maticulum.sol");

module.exports = async (deployer, network, accounts) => {
   await deployer.deploy(Maticulum);
   const instance = await Maticulum.deployed();

   if (network === 'develop') {
      console.log('---=== Adding test data ===---');

      await instance.registerUser('ADMIN 1', 'Super', 'France', '10/07/2021', 'a@a.com', '123', '123');
      await instance.setSuperAdmin(accounts[0]);

      await instance.updateSchoolValidationThreshold(1);

      await instance.addSchool('Alyra', 'Paris', 'France', accounts[0], accounts[1]);
      await instance.validateSchool(0);
   }
};
