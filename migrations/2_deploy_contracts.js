var NFTContract = artifacts.require("./MaticulumNFT.sol");
var MaticulumContract = artifacts.require("./Maticulum.sol");
var SchoolContract = artifacts.require("./MaticulumSchool.sol");
var TrainingContract = artifacts.require("./MaticulumTraining.sol");


module.exports = async (deployer, network, accounts) => {

   await deployer.deploy(NFTContract, 
   "https://gateway.pinata.cloud/ipfs/",
   "https://api.pinata.cloud/pinning/pinJSONToIPFS/",
   "https://api.pinata.cloud/pinning/pinFileToIPFS/",
   "https://api.pinata.cloud/pinning/unpin/",
   "MWE1OWNlMDNhYTA0NmU4MjM2MTVhbnQ",
   "MjMwZWNlZDljNDk3Mzc1MmFhZDE0MTMwYzI0NTI5ZGQ2YjljNDY1ZmI4ZTQ5OGEyYmZmMjNmZGEyOTljYTVkNGFudA==",
   "DiplomeNFT",
   "MTCF",
   "QmYFRV2wZtPjGgKXQkHKEcw8ayuYDcNyUcuYFy726h5DuC"
   );
   const nft = await NFTContract.deployed();
   
   await deployer.deploy(MaticulumContract, NFTContract.address);
   const maticulum = await MaticulumContract.deployed();
   await nft.transferOwnership(MaticulumContract.address);

   await deployer.deploy(SchoolContract, MaticulumContract.address);
   const school = await SchoolContract.deployed();

   await deployer.deploy(TrainingContract, MaticulumContract.address, SchoolContract.address);
   const training = await TrainingContract.deployed();

   await maticulum.registerTrainingContract(TrainingContract.address);
   await school.registerTrainingContract(TrainingContract.address);

   if (network === 'develop' || network === 'rinkeby') {
      console.log('---=== Adding test data ===---');

      const superAdmin = accounts[0];
      const schoolAdmin = '0xffA883E5a748fb540cc7aC7BEaf1eC9E66704DA7';
      const jury = '0xc12C11E57Ecb2AD9B498b539A7CFA0D2e96C5f6C';
      const student1 = '0xaAb6D3B45938653DB06932b581038Ddf25D9F254';
      const student2 = '0x85e4EB0259882400D9099eDe2554859E6C95FF6c';

      await maticulum.registerUser('COTTON', 'Nicola', 'France', '10/07/2021', 'a@a.com', '123', '123');
      await maticulum.setSuperAdmin(superAdmin);

      console.log('=> addUser');
      await maticulum.addUser(schoolAdmin, 'Franciszek', 'CANTU', 0x03);
      await maticulum.addUser(jury, 'Dalia', 'HOWARD', 0x03);
      await maticulum.addUser(student1, 'Harper-Rose', 'PARKES', 0x01);
      await maticulum.addUser(student2, 'Lilly-May', 'BELL', 0x01);

      console.log('=> updateSchoolValidationThreshold');
      await school.updateSchoolValidationThreshold(1);

      console.log('=> addSchool');
      await school.addSchool('Alyra', 'Paris', 'France', 2, superAdmin, schoolAdmin);
      await school.validateSchool(0);

      console.log('=> addTraining');
      await training.addTraining(0, 'Chef de projet', 'Aucun', 350, 1, [ jury ]);
      await training.addTraining(0, 'Developpeur', 'Aucun', 350, 1, [ jury ]);

      console.log('=> addUserTraining');
      await training.addUserTraining(student1, 0);
      await training.addUserTraining(student1, 1);
      await training.addUserTraining(student2, 1);
   }

};
