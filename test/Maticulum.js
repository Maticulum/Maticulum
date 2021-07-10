const { BN, ether } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const Maticulum = artifacts.require('./MaticulumNFT.sol');
const {expectRevert} = require('@openzeppelin/test-helpers');

contract('Maticulum', accounts => {
  const owner = accounts[0];	

  beforeEach(async () => {
		this.Maticulum = await Maticulum.new();
	 });	

  it("init URI id", async () => {    
    let uriId = await this.Maticulum.getlastUriId();
	assert.equal(uriId, 0, "The NFT stored has not value 1.");
  });

  it("Mint a NFT and get URI id", async () => {
    let uriId = await this.Maticulum.AddNFTToAdress(owner, "tmTRqsdvJGPViJFHoCdQ4jcWhDDqb7D4H1Ynpk15EgKXua", { from: owner })
    let uriIdCall = await this.Maticulum.getlastUriId();
	assert.equal(uriIdCall, 1, "The NFT stored has not value 1.");
  });
  
  it("Error : Mint a NFT hash already stored", async () => {
    await this.Maticulum.AddNFTToAdress(owner, "tmTRqsdvJGPViJFHoCdQ4jcWhDDqb7D4H1Ynpk15EgKXua", { from: owner })	
    await expectRevert(this.Maticulum.AddNFTToAdress(owner, "tmTRqsdvJGPViJFHoCdQ4jcWhDDqb7D4H1Ynpk15EgKXua", { from: owner }), "Hash already minted");
  });

  it("Gateway init", async () => {
	const hash = "tmTRqsdvJGPViJFHoCdQ4jcWhDDqb7D4H1Ynpk15EgKXua";
    await this.Maticulum.AddNFTToAdress(owner, hash, { from: owner })	
    let tokenURI = await this.Maticulum.tokenURI(1);
	const gatewayAddress = "https://gateway.pinata.cloud/ipfs/";
	assert.equal(gatewayAddress + hash, tokenURI, "The NFT stored has not value awaited uri.");
  });
  
  it("Gateway change", async () => {
	const hash = "tmTRqsdvJGPViJFHoCdQ4jcWhDDqb7D4H1Ynpk15EgKXua";
	const gatewayAddress = "https://maticulumOwnGateway.cloud/ipfs/";
	await this.Maticulum.changeGateway(gatewayAddress, { from: owner })
    await this.Maticulum.AddNFTToAdress(owner, hash, { from: owner })	
    let tokenURI = await this.Maticulum.tokenURI(1);	
	assert.equal(gatewayAddress + hash, tokenURI, "The NFT stored has not value awaited uri.");
  });
  
});
