const Maticulum = artifacts.require('./Maticulum.sol');
const {expectRevert} = require('@openzeppelin/test-helpers');

contract('Maticulum', accounts => {
  const owner = accounts[0];  
  const user2 = accounts[1];
  
  beforeEach(async () => {
	this.Maticulum = await Maticulum.new();
  });

  it("is not user admin", async () => {    
    let isAdmin = await this.Maticulum.isSuperAdmin(user2);
	assert.equal(isAdmin, false, "The user should not be admin");
  });

  it("is user admin", async () => {  
    await this.Maticulum.setSuperAdmin(user2,  { from: owner });
    let isAdmin = await this.Maticulum.isSuperAdmin(user2);
	assert.equal(isAdmin, true, "The user should not be admin");
  });
  
  it("is user regitered", async () => {  
    await this.Maticulum.validateUser(user2,  { from: owner });
    let registered = await this.Maticulum.isRegistered(user2);
	assert.equal(registered, true, "The user is not registered");
  });
  
  it("getUserHash", async () => {  
    let hashTest = "hashTest";
	let roleTest = 0x03;
    await this.Maticulum.registerUserHash(user2,hashTest, roleTest, { from: owner });
    let datas = await this.Maticulum.getUserHash(user2);
	let hash = datas[0];
	let role = datas[1];
	assert.equal(hash, hashTest, "The user hash should be hashTest");
	assert.equal(role, roleTest, "The user hash should be 0x03");
  });
  
  it("getUserRole", async () => {  
	let roleTest = 0x03;
    await this.Maticulum.addUser(user2,roleTest, { from: owner });
    let datas = await this.Maticulum.getUserHash(user2);
	let role = datas[1];
	assert.equal(role, roleTest, "The user hash should be 0x03");
  });
  
  it("getUser", async () => {  
    let hashTest = "hashTest";
	let roleTest = 0x03;
    await this.Maticulum.registerUserHash(user2,hashTest, roleTest, { from: owner });
    let datas = await this.Maticulum.getUser({ from: user2 });
	let hash = datas[0];
	let role = datas[1];
	assert.equal(hash, hashTest, "The user hash should be hashTest");
	assert.equal(role, roleTest, "The user hash should be 0x03");
  });
});


