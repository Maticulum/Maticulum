var NFTContract = artifacts.require("./MaticulumNFT.sol");
var MaticulumContract = artifacts.require("./Maticulum.sol");
var SchoolContract = artifacts.require("./MaticulumSchool.sol");
var TrainingContract = artifacts.require("./MaticulumTraining.sol");


module.exports = async (deployer, network, accounts) => {

   await deployer.deploy(MaticulumContract);
   const maticulum = await MaticulumContract.deployed();

   await deployer.deploy(SchoolContract, MaticulumContract.address);
   const school = await SchoolContract.deployed();

   await deployer.deploy(TrainingContract, MaticulumContract.address, SchoolContract.address);
   const training = await TrainingContract.deployed();

   await maticulum.registerTrainingContract(TrainingContract.address);
   await school.registerTrainingContract(TrainingContract.address);
      
   await deployer.deploy(NFTContract, 
   "https://gateway.pinata.cloud/ipfs/",
   "https://api.pinata.cloud/pinning/pinJSONToIPFS/",
   "https://api.pinata.cloud/pinning/pinFileToIPFS/",
   "https://api.pinata.cloud/pinning/unpin/",
   "MWE1OWNlMDNhYTA0NmU4MjM2MTVhbnQ",
   "MjMwZWNlZDljNDk3Mzc1MmFhZDE0MTMwYzI0NTI5ZGQ2YjljNDY1ZmI4ZTQ5OGEyYmZmMjNmZGEyOTljYTVkNGFudA==",
   "DiplomeNFT",
   "MTCF",
   "QmYFRV2wZtPjGgKXQkHKEcw8ayuYDcNyUcuYFy726h5DuC");

   if (network === 'develop' || network === 'rinkeby') {
      console.log('---=== Adding test data ===---');

      const superAdmin = accounts[0];
      const superAdmin2 = '0x487F7092D1866b7426514a543651a70C4F2E3dbB';
      const schoolAdmin = '0xffA883E5a748fb540cc7aC7BEaf1eC9E66704DA7';
      const schoolAdmin2 = '0x3Fb7497eB291Ef633d383829bE11bD971353BFf8';
      const jury = '0xc12C11E57Ecb2AD9B498b539A7CFA0D2e96C5f6C';
      const jury2 = '0xcD6c39F7D241E752ae22fD75C2644C73d3071585';
      const student1 = '0xaAb6D3B45938653DB06932b581038Ddf25D9F254';
      const student2 = '0x85e4EB0259882400D9099eDe2554859E6C95FF6c';
      const student3 = '0x82Ee53789484F959689449F5FFa243D34cfEaa05';
      const student4 = '0xc50405e65d9826242f3e338b6eFC81d463b4d26A';

      console.log('=> addUser');
      await maticulum.addUser(superAdmin, 0x03);
      await maticulum.addUser(superAdmin2, 0x03);
      await maticulum.addUser(schoolAdmin, 0x03);
      await maticulum.addUser(schoolAdmin2, 0x03);
      await maticulum.addUser(jury, 0x03);
      await maticulum.addUser(jury2, 0x03);
      await maticulum.addUser(student1, 0x03);
      await maticulum.addUser(student2, 0x03);
      await maticulum.addUser(student3, 0x01);
      await maticulum.addUser(student4, 0x01);

      await maticulum.setSuperAdmin(superAdmin);
      await maticulum.setSuperAdmin(superAdmin2);

      console.log('=> addSchool');
      await school.addSchool('Alyra', 'Paris', 'France', 2, schoolAdmin, schoolAdmin2, { value: "100000000000000000" });
      await school.validateAdministratorMultiple(0, [schoolAdmin, schoolAdmin2]);
      await school.validateAdministratorMultiple(0, [schoolAdmin, schoolAdmin2], { from: superAdmin2 });

      console.log('=> addTraining');
      await training.addTraining(0, 'Chef de projet', 'Aucun', 0, 1, [ jury, jury2 ], { from: schoolAdmin });
      await training.addTraining(0, 'Developpeur', 'Aucun', 350, 1, [ jury, jury2 ], { from: schoolAdmin2 });

      console.log('=> addUserTraining');
      await training.addUserTraining(student1, 0);
      await training.addUserTraining(student1, 1);
      await training.addUserTraining(student2, 1);
   }

};
