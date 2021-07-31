const MaticulumNFT = artifacts.require('./MaticulumNFT.sol');
const Maticulum = artifacts.require('./Maticulum.sol');

const MaticulumContract = artifacts.require("./Maticulum.sol");
const SchoolContract = artifacts.require("./MaticulumSchool.sol");
const TrainingContract = artifacts.require("./MaticulumTraining.sol");

const {expectRevert} = require('@openzeppelin/test-helpers');

contract('MaticulumNFT', accounts => {
  const owner = accounts[0];
  const user2 = accounts[1];
  const hashDefaut = "tmTRqsdvJGPViJFHoCdQ4jcWhDDqb7D4H1Ynpk15EgKXua"
  const hashes = [hashDefaut]; 
  const gatewayUrl = "https://gateway.pinata.cloud/ipfs/";
  const urltoJSonApi = "https://api.pinata.cloud/pinning/pinJSONToIPFS/";
  const urltoImageApi = "https://api.pinata.cloud/pinning/pinFileToIPFS/";
  const urlToPinApi = "https://api.pinata.cloud/pinning/unpin/";
  const hashtoApikey = "MWE1OWNlMDNhYTA0NmU4MjM2MTVhbnQ";
  const hashtoSecretApikey = "MjMwZWNlZDljNDk3Mzc1MmFhZDE0MTMwYzI0NTI5ZGQ2YjljNDY1ZmI4ZTQ5OGEyYmZmMjNmZGEyOTljYTVkNGFudA==";
  const name = "DiplomeNFT";
  const symbol = "MTCF"
  const hashToImageToken = "QmYFRV2wZtPjGgKXQkHKEcw8ayuYDcNyUcuYFy726h5DuC";;
  const schoolAdmin = '0xffA883E5a748fb540cc7aC7BEaf1eC9E66704DA7';
  const users = ["",""];
  const student1 = '0xaAb6D3B45938653DB06932b581038Ddf25D9F254';
  let diplomas = {schoolId:0,trainingId:0,userAddresses: ["0x0000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000"]}
			
  
			   
  beforeEach(async () => {
		this.MaticulumNFT = await MaticulumNFT.new(gatewayUrl,urltoJSonApi,urltoImageApi,urlToPinApi,
		hashtoApikey, hashtoSecretApikey,name,symbol, hashToImageToken);
		await this.MaticulumNFT.registerSchoolTrainingContract(
		"0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000",
		{ from: owner });
		await this.MaticulumNFT.setTestMode(true, { from: owner });
	 });	

  it("init URI id", async () => {    
    let uriId = await this.MaticulumNFT.getlastUriId();
	assert.equal(uriId, 0, "The NFT stored has not value 1.");
  });

  it("Mint a NFT and get URI id", async () => {	  
    let uriId = await this.MaticulumNFT.AddNFTsToAdress(hashes,diplomas, { from: owner })
    let uriIdCall = await this.MaticulumNFT.getlastUriId();
	assert.equal(uriIdCall, 1, "The NFT stored has not value 1.");
  });
  
  it("Error : Mint a NFT hash already stored", async () => {
    await this.MaticulumNFT.AddNFTsToAdress(hashes,diplomas, { from: owner });	
	const hashesWithSameHash = [hashDefaut];
    await expectRevert(this.MaticulumNFT.AddNFTsToAdress(hashesWithSameHash,diplomas, { from: owner }), "Hash already minted");
  });
  
  it("Error : Mint a NFT list one hash already stored in list", async () => {
    await this.MaticulumNFT.AddNFTsToAdress(hashes,diplomas, { from: owner })	
	const hashesOneWithSameHash = ["zmTRqsdvJGPViJFHoCdQ4jcWhDDqb7D4H1Ynpk15EgKXua"];
	hashesOneWithSameHash.push(hashDefaut);
    await expectRevert(this.MaticulumNFT.AddNFTsToAdress(hashesOneWithSameHash,diplomas, { from: owner }), "Hash already minted");
  });
  
  it("Error : Mint a NFT list with two same hashes in list", async () => {	
	const hashDoubleInList = [];
	const hashInDouble = "zmTRqsdvJGPViJFHoCdQ4jcWhDDqb7D4H1Ynpk15EgKXua";
	hashDoubleInList.push(hashInDouble);
	hashDoubleInList.push(hashDefaut);
	hashDoubleInList.push(hashInDouble);
    await expectRevert(this.MaticulumNFT.AddNFTsToAdress(hashDoubleInList,diplomas, { from: owner }), "Hash already in the list");
  });
  
  it("Error : Mint a NFT Invalid hash length", async () => {	
	const hashInvalidLength = ["TRqsdvJGPViJFHoCdQ4jcWhDDqb7D4H1Ynpk15EgKXua"];
    await expectRevert(this.MaticulumNFT.AddNFTsToAdress(hashInvalidLength,diplomas, { from: owner }), "Invalid hash length");
  });
  
  it("Error : Mint a NFT list one hash with Invalid length in list", async () => {	
	const hashesOneWithInvalidLenth = [hashDefaut];
	hashesOneWithInvalidLenth.push("TRqsdvJGPViJFHoCdQ4jcWhDDqb7D4H1Ynpk15EgKXua");
    await expectRevert(this.MaticulumNFT.AddNFTsToAdress(hashesOneWithInvalidLenth,diplomas, { from: owner }), "Invalid hash length");
  });

  it("Gateway init", async () => {
	const hashTwo = "zmTRqsdvJGPViJFHoCdQ4jcWhDDqb7D4H1Ynpk15EgKXua";
	const hashThree= "rmTRqsdvJGPViJFHoCdQ4jcWhDDqb7D4H1Ynpk15EgKXua";
	hashes.push(hashTwo);
	hashes.push(hashThree);
    await this.MaticulumNFT.AddNFTsToAdress(hashes,diplomas, { from: owner });	
    let tokenURI = await this.MaticulumNFT.tokenURI(1);
	assert.equal(gatewayUrl + hashDefaut, tokenURI, "The initial gateway should be https://gateway.pinata.cloud/ipfs/.");
  }); 
  
  it("Get lasturi init", async () => {	
    let lastUri = await this.MaticulumNFT.getlastUriId();	
	assert.equal(lastUri, 0, "The Last URI should be 0.");
  });
  
  it("Get last uri after inserted one NFT", async () => {
    await this.MaticulumNFT.AddNFTsToAdress(["rmTRqsdvJGPViJFHoCdQ4jcWhDDqb7D4H1Ynpk15EgKXua"],diplomas, { from: owner })	
    let lastUri = await this.MaticulumNFT.getlastUriId();	
	assert.equal(lastUri, 1, "The Last URI should be 1.");
  });
  
  it("Error Uri not yet stored when called 1 and no NFT added", async () => {	
	await expectRevert(this.MaticulumNFT.getURI(1, { from: owner }), "Uri not yet stored");
  });
  
  it("Error Uri not yet stored when called 2 and 1 NFT added", async () => {	
    await this.MaticulumNFT.AddNFTsToAdress(["rmTRqsdvJGPViJFHoCdQ4jcWhDDqb7D4H1Ynpk15EgKXua"],diplomas, { from: owner });	
	await expectRevert(this.MaticulumNFT.getURI(2, { from: owner }), "Uri not yet stored");
  });
  
  it("Default gateways data", async () => {	    	
	let gatewayDatas = await this.MaticulumNFT.getGatewaysData({ from: owner });
	assert.equal(gatewayDatas[0], "https://gateway.pinata.cloud/ipfs/");
	assert.equal(gatewayDatas[1], "https://api.pinata.cloud/pinning/pinJSONToIPFS/");
	assert.equal(gatewayDatas[2], "https://api.pinata.cloud/pinning/pinFileToIPFS/");
	assert.equal(gatewayDatas[3], "https://api.pinata.cloud/pinning/unpin/");
	assert.equal(gatewayDatas[4], "MWE1OWNlMDNhYTA0NmU4MjM2MTVhbnQ");
	assert.equal(gatewayDatas[5], "MjMwZWNlZDljNDk3Mzc1MmFhZDE0MTMwYzI0NTI5ZGQ2YjljNDY1ZmI4ZTQ5OGEyYmZmMjNmZGEyOTljYTVkNGFudA==");		
  });
  
  it("Change gateways data", async () => {
	
	const newGatewayUrl = "https://maticulum.cloud/ipfs/";
	const newUrltoJSonApi = "https://filecoin.api/pinJSONToIPFS/";
	const newUrltoImageApi = "https://filecoin.api/pinFileToIPFS/";
	const newUrlToPinApi = "https://filecoin.api/unpin/";
	const newHashtoApikey = "AWE1SWNlMDNhYTA0NmU4OjM2UTVhbnQ";
	const newHashtoSecretApikey = "AAAAAWNlZDljNDk3Mzc1MmFhZDE0MTMwYzI0NTI5ZGQ2YjljNDY1ZmI4ZTQ5OGEyYmZmMjNmZGEyOTljYTVkNGFudA==";
	  
	await this.MaticulumNFT.modifyGatewaysData(newGatewayUrl,newUrltoJSonApi,newUrltoImageApi,
											newUrlToPinApi,newHashtoApikey,newHashtoSecretApikey,
											{ from: owner });
	let gatewayDatas = await this.MaticulumNFT.getGatewaysData({ from: owner });
	assert.equal(gatewayDatas[0], newGatewayUrl, "not awaited field");
	assert.equal(gatewayDatas[1], newUrltoJSonApi, "not awaited field");
	assert.equal(gatewayDatas[2], newUrltoImageApi, "not awaited field");
	assert.equal(gatewayDatas[3], newUrlToPinApi, "not awaited field");
	assert.equal(gatewayDatas[4], newHashtoApikey, "not awaited field");
	assert.equal(gatewayDatas[5], newHashtoSecretApikey, "not awaited field");
  });
  
  it("init NFTs data", async () => {	

	let nftDatas = await this.MaticulumNFT.getNFTDatas({ from: owner });
	
	assert.equal(nftDatas[0], "DiplomeNFT", "not awaited field");
	assert.equal(nftDatas[1], "MTCF", "not awaited field");
	assert.equal(nftDatas[2], "QmYFRV2wZtPjGgKXQkHKEcw8ayuYDcNyUcuYFy726h5DuC", "not awaited field");
  });
  
  it("change NFTs hash image", async () => {	
    const hasItemToken = "AAAAAV2wZtPjGgKXQkHKEcw8ayuYDcNyUcuYFy726h5DuC"
	await this.MaticulumNFT.modifyHashToImageToken(hasItemToken,{ from: owner });
	let nftDatas = await this.MaticulumNFT.getNFTDatas({ from: owner });
	
	assert.equal(nftDatas[2], hasItemToken, "not awaited field");
  });
  
  it("error NFTs hash image token length", async () => {	
    const hasItemToken = "AAAAAV2wZtPjGgKXQkHKEcw8ayuYDcNyUcuYFy726h5DuC11"
	await expectRevert(this.MaticulumNFT.modifyHashToImageToken(hasItemToken,{ from: owner }), "Invalid hash length");
  });
  
  it("Mint a list of NFTs and get list of uris", async () => {
	const hashOne = "7mYFRV2wZtPjGgKXQkHKEcw8ayuYDcNyUcuYFy726h5DuC";
	const hashTwo = "QmYFRV2wZtPjGgKXQkHKEcw8ayuYDcNyUcuYFy726h5DuC";
	const hashThree = "gmYFRV2wZtPjGgKXQkHKEcw8ayuYDcNyUcuYFy726h5DuC";
	hashes.push(hashTwo);
	hashes.push(hashThree);
    await this.MaticulumNFT.AddNFTsToAdress([hashOne,hashTwo, hashThree],diplomas, { from: owner })
	const hashFour = "YmYFRV2wZtPjGgKXQkHKEcw8ayuYDcNyUcuYFy726h5DuC";
	const hashFive = "ZmYFRV2wZtPjGgKXQkHKEcw8ayuYDcNyUcuYFy726h5DuC";
	
	const hashesUser2 = [hashFour,hashFive];
	await this.MaticulumNFT.AddNFTsToAdress(hashesUser2,diplomas, { from: user2 })
	let gatewayDatas = await this.MaticulumNFT.getGatewaysData();
	let gatewayUrl = gatewayDatas[0];
	
    let urisOwner = await this.MaticulumNFT.getUrisByAddress(owner);
	assert.equal(urisOwner.length, 3, "The length of the uri stored by user should be 3");
	assert.equal(await this.MaticulumNFT.getURI(urisOwner[0],{ from: owner }),gatewayUrl + hashOne, "Not awaited hash");
	assert.equal(await this.MaticulumNFT.getURI(urisOwner[1],{ from: owner }),gatewayUrl + hashTwo, "Not awaited hash");
	assert.equal(await this.MaticulumNFT.getURI(urisOwner[2],{ from: owner }),gatewayUrl + hashThree, "Not awaited hash");
	
	let urisUser2 = await this.MaticulumNFT.getUrisByAddress(user2);
	assert.equal(urisUser2.length, 2, "The length of the uri stored by user should be 2");
	assert.equal(await this.MaticulumNFT.getURI(urisUser2[0],{ from: owner }),gatewayUrl + hashFour, "Not awaited hash");
	assert.equal(await this.MaticulumNFT.getURI(urisUser2[1],{ from: owner }),gatewayUrl + hashFive, "Not awaited hash");
  });
  
  it("Mint a list of 201 NFTs and get error Gaz limit security", async () => {
	const hashes200 = [];
	
	for(let i = 100; i < 302; i++){
		hashes200.push(i + "FRV2wZtPjGgKXQkHKEcw8ayuYDcNyUcuYFy726h5DuC");
	}
	
	await expectRevert(this.MaticulumNFT.AddNFTsToAdress(hashes200,diplomas, { from: owner }), "Gaz limit security");	
  });
  
  it("mint validated diplomas", async () => {
	await this.MaticulumNFT.setTestMode(false, { from: owner });
	this.MaticulumContract = await MaticulumContract.new();
	this.SchoolContract = await SchoolContract.new(this.MaticulumContract.address);
	this.TrainingContract = await TrainingContract.new(
	this.MaticulumContract.address, this.SchoolContract.address);

    await this.MaticulumContract.registerTrainingContract(this.TrainingContract.address);
    await this.SchoolContract.registerTrainingContract(this.TrainingContract.address);
	
	await this.MaticulumNFT.registerSchoolTrainingContract(
		this.SchoolContract.address, this.TrainingContract.address,
		{ from: owner });
	
	const superAdmin = accounts[0];
    const superAdmin2 = '0x487F7092D1866b7426514a543651a70C4F2E3dbB';
    const schoolAdmin = '0xffA883E5a748fb540cc7aC7BEaf1eC9E66704DA7';
    const schoolAdmin2 = '0x3Fb7497eB291Ef633d383829bE11bD971353BFf8';
    const jury = '0xc12C11E57Ecb2AD9B498b539A7CFA0D2e96C5f6C';
    const student1 = '0xaAb6D3B45938653DB06932b581038Ddf25D9F254';

    await this.MaticulumContract.addUser(superAdmin, 0x03);
    await this.MaticulumContract.addUser(superAdmin2, 0x03);
    await this.MaticulumContract.addUser(schoolAdmin, 0x03);
    await this.MaticulumContract.addUser(schoolAdmin2, 0x03);
    await this.MaticulumContract.addUser(jury, 0x03);
    await this.MaticulumContract.addUser(student1, 0x03);

    await this.MaticulumContract.setSuperAdmin(superAdmin);
    await this.MaticulumContract.setSuperAdmin(superAdmin2);

    await this.SchoolContract.addSchool('Alyra', 'Paris', 'France', 2, schoolAdmin, schoolAdmin2, { value: "100000000000000000" });

    await this.SchoolContract.validateAdministratorMultiple(0, [schoolAdmin, schoolAdmin2]);
    await this.SchoolContract.validateAdministratorMultiple(0, [schoolAdmin, schoolAdmin2], { from: superAdmin2 });

    await this.TrainingContract.addTraining(0, 'Chef de projet Blockchain', 'n/a', 0, 1, [ jury], { from: schoolAdmin });
    
    await this.TrainingContract.validateUserTrainingRequestDirect(0, student1, { from: schoolAdmin });

    await this.TrainingContract.validateDiplomaMultipleUsers(0, [student1], { from: jury });
	
	const hashOne = "7mYFRV2wZtPjGgKXQkHKEcw8ayuYDcNyUcuYFy726h5DuC";
	let diplomas = { schoolId:0,trainingId:0,userAddresses: [student1]};		
	await this.MaticulumNFT.AddNFTsToAdress([hashOne],diplomas, { from: schoolAdmin });
	assert.equal(await this.MaticulumNFT.getURI(1,{ from: schoolAdmin }),gatewayUrl + hashOne, "Not awaited hash");
  });
  
});
