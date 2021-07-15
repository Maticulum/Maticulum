const { BN, ether } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const Maticulum = artifacts.require('./MaticulumNFT.sol');
const {expectRevert} = require('@openzeppelin/test-helpers');

contract('Maticulum', accounts => {
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
  
  
			   
  beforeEach(async () => {
		this.Maticulum = await Maticulum.new(gatewayUrl,urltoJSonApi,urltoImageApi,urlToPinApi,
		hashtoApikey, hashtoSecretApikey,name,symbol, hashToImageToken);
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
  
  it("Error : Mint a NFT list with two same hashes in list", async () => {	
	const hashDoubleInList = [];
	const hashInDouble = "zmTRqsdvJGPViJFHoCdQ4jcWhDDqb7D4H1Ynpk15EgKXua";
	hashDoubleInList.push(hashInDouble);
	hashDoubleInList.push(hashDefaut);
	hashDoubleInList.push(hashInDouble);
    await expectRevert(this.Maticulum.AddNFTsToAdress(owner, hashDoubleInList, { from: owner }), "Hash already in the list");
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
	const hashTwo = "zmTRqsdvJGPViJFHoCdQ4jcWhDDqb7D4H1Ynpk15EgKXua";
	const hashThree= "rmTRqsdvJGPViJFHoCdQ4jcWhDDqb7D4H1Ynpk15EgKXua";
	hashes.push(hashTwo);
	hashes.push(hashThree);
    await this.Maticulum.AddNFTsToAdress(owner, hashes, { from: owner })	
    let tokenURI = await this.Maticulum.tokenURI(1);
	assert.equal(gatewayUrl + hashDefaut, tokenURI, "The initial gateway should be https://gateway.pinata.cloud/ipfs/.");
  }); 
  
  it("Get lasturi init", async () => {	
    let lastUri = await this.Maticulum.getlastUriId();	
	assert.equal(lastUri, 0, "The Last URI should be 0.");
  });
  
  it("Get last uri after inserted one NFT", async () => {
    await this.Maticulum.AddNFTsToAdress(owner, ["rmTRqsdvJGPViJFHoCdQ4jcWhDDqb7D4H1Ynpk15EgKXua"], { from: owner })	
    let lastUri = await this.Maticulum.getlastUriId();	
	assert.equal(lastUri, 1, "The Last URI should be 1.");
  });
  
  it("Error Uri not yet stored when called 1 and no NFT added", async () => {	
	await expectRevert(this.Maticulum.getURI(1, { from: owner }), "Uri not yet stored");
  });
  
  it("Error Uri not yet stored when called 2 and 1 NFT added", async () => {	
    await this.Maticulum.AddNFTsToAdress(owner, ["rmTRqsdvJGPViJFHoCdQ4jcWhDDqb7D4H1Ynpk15EgKXua"], { from: owner });	
	await expectRevert(this.Maticulum.getURI(2, { from: owner }), "Uri not yet stored");
  });
  
  it("Default gateways data", async () => {	    	
	let gatewayDatas = await this.Maticulum.getGatewaysData({ from: owner });
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
	  
	await this.Maticulum.modifyGatewaysData(newGatewayUrl,newUrltoJSonApi,newUrltoImageApi,
											newUrlToPinApi,newHashtoApikey,newHashtoSecretApikey,
											{ from: owner });
	let gatewayDatas = await this.Maticulum.getGatewaysData({ from: owner });
	assert.equal(gatewayDatas[0], newGatewayUrl, "not awaited field");
	assert.equal(gatewayDatas[1], newUrltoJSonApi, "not awaited field");
	assert.equal(gatewayDatas[2], newUrltoImageApi, "not awaited field");
	assert.equal(gatewayDatas[3], newUrlToPinApi, "not awaited field");
	assert.equal(gatewayDatas[4], newHashtoApikey, "not awaited field");
	assert.equal(gatewayDatas[5], newHashtoSecretApikey, "not awaited field");
  });
  
  it("init NFTs data", async () => {	

	let nftDatas = await this.Maticulum.getNFTDatas({ from: owner });
	
	assert.equal(nftDatas[0], "DiplomeNFT", "not awaited field");
	assert.equal(nftDatas[1], "MTCF", "not awaited field");
	assert.equal(nftDatas[2], "QmYFRV2wZtPjGgKXQkHKEcw8ayuYDcNyUcuYFy726h5DuC", "not awaited field");
  });
  
  it("change NFTs hash image", async () => {	
    const hasItemToken = "AAAAAV2wZtPjGgKXQkHKEcw8ayuYDcNyUcuYFy726h5DuC"
	await this.Maticulum.modifyHashToImageToken(hasItemToken,{ from: owner });
	let nftDatas = await this.Maticulum.getNFTDatas({ from: owner });
	
	assert.equal(nftDatas[2], hasItemToken, "not awaited field");
  });
  
  it("Mint a list of NFTs and get list of uris", async () => {
	const hashOne = "7mYFRV2wZtPjGgKXQkHKEcw8ayuYDcNyUcuYFy726h5DuC";
	const hashTwo = "QmYFRV2wZtPjGgKXQkHKEcw8ayuYDcNyUcuYFy726h5DuC";
	const hashThree = "gmYFRV2wZtPjGgKXQkHKEcw8ayuYDcNyUcuYFy726h5DuC";
	hashes.push(hashTwo);
	hashes.push(hashThree);
    await this.Maticulum.AddNFTsToAdress(owner, [hashOne,hashTwo, hashThree], { from: owner })
	const hashFour = "YmYFRV2wZtPjGgKXQkHKEcw8ayuYDcNyUcuYFy726h5DuC";
	const hashFive = "ZmYFRV2wZtPjGgKXQkHKEcw8ayuYDcNyUcuYFy726h5DuC";
	
	const hashesUser2 = [hashFour,hashFive];
	await this.Maticulum.AddNFTsToAdress(user2, hashesUser2, { from: owner })
	let gatewayDatas = await this.Maticulum.getGatewaysData();
	let gatewayUrl = gatewayDatas[0];
	
    let urisOwner = await this.Maticulum.getUrisByAddress(owner);
	assert.equal(urisOwner.length, 3, "The length of the uri stored by user should be 3");
	assert.equal(await this.Maticulum.getURI(urisOwner[0],{ from: owner }),gatewayUrl + hashOne, "Not awaited hash");
	assert.equal(await this.Maticulum.getURI(urisOwner[1],{ from: owner }),gatewayUrl + hashTwo, "Not awaited hash");
	assert.equal(await this.Maticulum.getURI(urisOwner[2],{ from: owner }),gatewayUrl + hashThree, "Not awaited hash");
	
	let urisUser2 = await this.Maticulum.getUrisByAddress(user2);
	assert.equal(urisUser2.length, 2, "The length of the uri stored by user should be 2");
	assert.equal(await this.Maticulum.getURI(urisUser2[0],{ from: owner }),gatewayUrl + hashFour, "Not awaited hash");
	assert.equal(await this.Maticulum.getURI(urisUser2[1],{ from: owner }),gatewayUrl + hashFive, "Not awaited hash");
  });
  
});
