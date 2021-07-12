const { BN, ether } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const Maticulum = artifacts.require('./MaticulumNFT.sol');
const {expectRevert} = require('@openzeppelin/test-helpers');

contract('Maticulum', accounts => {
  const owner = accounts[0];
  const hashDefaut = "tmTRqsdvJGPViJFHoCdQ4jcWhDDqb7D4H1Ynpk15EgKXua"
  const hashes = [hashDefaut]; 
  const gatewayUrl = "https://gateway.pinata.cloud/ipfs/";
  // remix : ["tmTRqsdvJGPViJFHoCdQ4jcWhDDqb7D4H1Ynpk15EgKXua"]
			   
  beforeEach(async () => {
		this.Maticulum = await Maticulum.new(gatewayUrl);
	 });	

  it("init URI id", async () => {    
    let uriId = await this.Maticulum.getlastUriId();
	assert.equal(uriId, 0, "The NFT stored has not value 1.");
  });

  it("Mint a NFT and get URI id", async () => {
    let uriId = await this.Maticulum.AddNFTsToAdress(owner, hashes, { from: owner })
    let uriIdCall = await this.Maticulum.getlastUriId();
	assert.equal(uriIdCall, 1, "The NFT stored has not value 1.");
  });
  
  it("Error : Mint a NFT hash already stored", async () => {
    await this.Maticulum.AddNFTsToAdress(owner, hashes, { from: owner })	
	const hashesWithSameHash = [hashDefaut];
    await expectRevert(this.Maticulum.AddNFTsToAdress(owner, hashesWithSameHash, { from: owner }), "Hash already minted");
  });
  
  it("Error : Mint a NFT list one hash already stored in list", async () => {
    await this.Maticulum.AddNFTsToAdress(owner, hashes, { from: owner })	
	const hashesOneWithSameHash = ["zmTRqsdvJGPViJFHoCdQ4jcWhDDqb7D4H1Ynpk15EgKXua"];
	hashesOneWithSameHash.push(hashDefaut);
    await expectRevert(this.Maticulum.AddNFTsToAdress(owner, hashesOneWithSameHash, { from: owner }), "Hash already minted");
  });
  
  it("Error : Mint a NFT Invalid hash length", async () => {	
	const hashInvalidLength = ["TRqsdvJGPViJFHoCdQ4jcWhDDqb7D4H1Ynpk15EgKXua"];
    await expectRevert(this.Maticulum.AddNFTsToAdress(owner, hashInvalidLength, { from: owner }), "Invalid hash length");
  });
  
  it("Error : Mint a NFT list one hash with Invalid length in list", async () => {	
	const hashesOneWithInvalidLenth = [hashDefaut];
	hashesOneWithInvalidLenth.push("TRqsdvJGPViJFHoCdQ4jcWhDDqb7D4H1Ynpk15EgKXua");
    await expectRevert(this.Maticulum.AddNFTsToAdress(owner, hashesOneWithInvalidLenth, { from: owner }), "Invalid hash length");
  });

  it("Gateway init", async () => {
    await this.Maticulum.AddNFTsToAdress(owner, hashes, { from: owner })	
    let tokenURI = await this.Maticulum.tokenURI(1);
	assert.equal(gatewayUrl + hashDefaut, tokenURI, "The initial gateway should be https://gateway.pinata.cloud/ipfs/.");
  });
  
  it("Gateway change", async () => {
	const gatewayMaticulumUrl = "https://maticulumOwnGateway.cloud/ipfs/";
	await this.Maticulum.changeGateway(gatewayMaticulumUrl, { from: owner })
    await this.Maticulum.AddNFTsToAdress(owner, hashes, { from: owner })	
    let tokenURI = await this.Maticulum.tokenURI(1);	
	assert.equal(gatewayMaticulumUrl + hashDefaut, tokenURI, "The current gateway should be https://maticulumOwnGateway.cloud/ipfs/.");
  });
  
  it("Get lasturi init", async () => {	
    let lastUri = await this.Maticulum.getlastUriId();	
	assert.equal(lastUri, 0, "The Last URI should be 0.");
  });
  
  it("Get lasturi ", async () => {
    await this.Maticulum.AddNFTsToAdress(owner, hashes, { from: owner })	
    let lastUri = await this.Maticulum.getlastUriId();	
	assert.equal(lastUri, 1, "The Last URI should be 1.");
  });
  
  it("Error Uri not yet stored when called 1 and no NFT added", async () => {	
	await expectRevert(this.Maticulum.getURI(1, { from: owner }), "Uri not yet stored");
  });
  
  it("Error Uri not yet stored when called 2 and 1 NFT added", async () => {	
    await this.Maticulum.AddNFTsToAdress(owner, hashes, { from: owner });	
	await expectRevert(this.Maticulum.getURI(2, { from: owner }), "Uri not yet stored");
  });
  
  
  
});
