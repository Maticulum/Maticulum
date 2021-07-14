var Maticulum = artifacts.require("./Maticulum.sol");

module.exports = async (deployer, network, accounts) => {
   await deployer.deploy(Maticulum, "https://gateway.pinata.cloud/ipfs/",
   "https://api.pinata.cloud/pinning/pinJSONToIPFS/",
   "https://api.pinata.cloud/pinning/pinFileToIPFS/",
   "QmYFRV2wZtPjGgKXQkHKEcw8ayuYDcNyUcuYFy726h5DuC",
   'YWE2MGZmZTk3YjJlMTY0MTlkYmFhbnQ=',
   'YTRiZTFhMmE4NWQwNWQ2ZTM1MGExM2I4MjA0OWU0OWMxYWZlOWJiMzE3NTMxOTYzZTIzMWYwYTAzZDJhNzE1OGFudA==');
   const instance = await Maticulum.deployed();

   if (network === 'develop') {
      console.log('---=== Adding test data ===---');

      const superAdmin = accounts[0];
      const schoolAdmin = accounts[1];
      const jury = accounts[2];
      const student1 = accounts[3];
      const student2 = accounts[4];

      await instance.registerUser('COTTON', 'Nicola', 'France', '10/07/2021', 'a@a.com', '123', '123');
      await instance.setSuperAdmin(superAdmin);

      await instance.addUser(schoolAdmin, 'Franciszek', 'CANTU', 0x03);
      await instance.addUser(jury, 'Dalia', 'HOWARD', 0x03);
      await instance.addUser(student1, 'Harper-Rose', 'PARKES', 0x01);
      await instance.addUser(student2, 'Lilly-May', 'BELL', 0x01);

      await instance.updateSchoolValidationThreshold(1);

      await instance.addSchool('Alyra', 'Paris', 'France', superAdmin, schoolAdmin);
      await instance.validateSchool(0);

      await instance.addTraining(0, 'Chef de projet', 'Aucun', 350, 1, [ jury ]);
      await instance.addTraining(0, 'Developpeur', 'Aucun', 350, 1, [ jury ]);

      await instance.addUserTraining(student1, 0);
      await instance.addUserTraining(student1, 1);
      await instance.addUserTraining(student2, 1);
   }
};
