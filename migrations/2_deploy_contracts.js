var NFTContract = artifacts.require("./MaticulumNFT.sol");
var MaticulumContract = artifacts.require("./Maticulum.sol");
var SchoolContract = artifacts.require("./MaticulumSchool.sol");
var TrainingContract = artifacts.require("./MaticulumTraining.sol");


module.exports = async (deployer, network, accounts) => {

   await deployer.deploy(NFTContract, "https://gateway.pinata.cloud/ipfs/",
   "https://api.pinata.cloud/pinning/pinJSONToIPFS/",
   "https://api.pinata.cloud/pinning/pinFileToIPFS/",
   "QmYFRV2wZtPjGgKXQkHKEcw8ayuYDcNyUcuYFy726h5DuC",
   'YWE2MGZmZTk3YjJlMTY0MTlkYmFhbnQ=',
   'YTRiZTFhMmE4NWQwNWQ2ZTM1MGExM2I4MjA0OWU0OWMxYWZlOWJiMzE3NTMxOTYzZTIzMWYwYTAzZDJhNzE1OGFudA==');
   const nft = await NFTContract.deployed();
   
   await deployer.deploy(MaticulumContract, NFTContract.address);
   const maticulum = await MaticulumContract.deployed();
   await nft.transferOwnership(MaticulumContract.address);

   await deployer.deploy(SchoolContract, MaticulumContract.address);
   const school = await SchoolContract.deployed();

   await deployer.deploy(TrainingContract, MaticulumContract.address, SchoolContract.address);
   const training = await TrainingContract.deployed();

   await maticulum.registerTrainingContract(TrainingContract.address);

   if (network === 'develop') {
      console.log('---=== Adding test data ===---');

      const superAdmin = accounts[0];
      const schoolAdmin = accounts[1];
      const jury = accounts[2];
      const student1 = accounts[3];
      const student2 = accounts[4];

      await maticulum.registerUser('COTTON', 'Nicola', 'France', '10/07/2021', 'a@a.com', '123', '123');
      await maticulum.setSuperAdmin(superAdmin);

      await maticulum.addUser(schoolAdmin, 'Franciszek', 'CANTU', 0x03);
      await maticulum.addUser(jury, 'Dalia', 'HOWARD', 0x03);
      await maticulum.addUser(student1, 'Harper-Rose', 'PARKES', 0x01);
      await maticulum.addUser(student2, 'Lilly-May', 'BELL', 0x01);

      await school.updateSchoolValidationThreshold(1);

      await school.addSchool('Alyra', 'Paris', 'France', superAdmin, schoolAdmin);
      await school.validateSchool(0);

      await training.addTraining(0, 'Chef de projet', 'Aucun', 350, 1, [ jury ]);
      await training.addTraining(0, 'Developpeur', 'Aucun', 350, 1, [ jury ]);

      await training.addUserTraining(student1, 0);
      await training.addUserTraining(student1, 1);
      await training.addUserTraining(student2, 1);
   }

};
