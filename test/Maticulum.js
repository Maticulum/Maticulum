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
  
  it("registerUserHash", async () => {  	
    let hashTest = "hashTest";
	let roleTest = 0x03;
    await this.Maticulum.registerUserHash(user2,hashTest, roleTest, { from: owner });
    let datas = await this.Maticulum.getUserHash(user2);
	let hash = datas[0];
	let role = datas[1];
	assert.equal(hash, hashTest, "The user hash should be hashTest");
	assert.equal(role, roleTest, "The user hash should be 0x03");
  });
  
  it("registerUserHashes", async () => {    
	const student = '0x85e4EB0259882400D9099eDe2554859E6C95FF6c';
    const student1 = '0x82Ee53789484F959689449F5FFa243D34cfEaa05';
    const student2 = '0xc50405e65d9826242f3e338b6eFC81d463b4d26A';
    let hashTest = "hashTest";
	let hashTest2 = "hashTest2";
	let hashTest3 = "hashTest3";
	let roleTest = 0x03;
	let UserHashAdress1 = {hash:hashTest,role:roleTest,userAdress:student};
	let UserHashAdress2 = {hash:hashTest2,role:roleTest,userAdress:student1};
	let UserHashAdress3 = {hash:hashTest3,role:roleTest,userAdress:student2};
	let userDatas = [UserHashAdress1,UserHashAdress2,UserHashAdress3];
    await this.Maticulum.registerUsersHashes(userDatas, { from: owner });
	let data1 = await this.Maticulum.getUserHash(student);
	let data2 = await this.Maticulum.getUserHash(student1);
	let data3 = await this.Maticulum.getUserHash(student2);
	assert.equal(data1[0], hashTest, "The user hash should be hashTest");
	assert.equal(data2[0], hashTest2, "The user hash should be hashTest2");
	assert.equal(data3[0], hashTest3, "The user hash should be hashTest3");	
  });
  
  it("error registerUsersHashes : maxUserstoRegister", async () => {    
	const student = '0x85e4EB0259882400D9099eDe2554859E6C95FF6c';    
    let hashTest = "hashTest";
	let roleTest = 0x03;
	let userDatas = [];
    
	
	for(let i =0; i< 201;i++){
		userDatas.push({hash:hashTest,role:roleTest,userAdress:student});
	}
	
	await expectRevert(this.Maticulum.registerUsersHashes(userDatas, { from: owner }),
	">maxUserstoRegister");	
  });
  
  it("Error : registerUserHash hashUserLength>1000", async () => {    
	let hashTest = "hashTest";
	
	for(let i =0; i< 992;i++){
		hashTest += i;
	}
	
	let roleTest = 0x03;
    await expectRevert(this.Maticulum.registerUserHash(user2,hashTest, roleTest, { from: owner }),
	"hashUserLength>1000");    
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


