const catchRevert = require('../helper/exception').catchRevert;
const VotingRegistry = artifacts.require('./VotingRegistry');
const VotingCore = artifacts.require('./VotingCore');


contract("VotingCore", function(accounts) {
    /**
     * Test accounts
     */
    let testingAccountContractAdmin;
    let testingAccountNotContractAdmin;
    let testingAccountNewContractAdmin;

    let VotingRegistryInstance;
    let NewVotingRegistryInstance;
    let VotingCoreInstance;

    let optionTitles;
    let optionTitlesHex;
    let expiryBlockNumber;

    beforeEach('setup contract for each test', async () => {
        optionTitles = ['Allen', 'Bob', 'Alice'];
        optionTitlesHex = optionTitles.map(title => web3.utils.utf8ToHex(title));
        expiryBlockNumber = 999;
        testingAccountContractAdmin = accounts[0];
        testingAccountNotContractAdmin = accounts[1];
        testingAccountNewContractAdmin = accounts[2];
        VotingRegistryInstance = await VotingRegistry.new({from: testingAccountContractAdmin});
        NewVotingRegistryInstance = await VotingRegistry.new({from: testingAccountContractAdmin});
        VotingCoreInstance = await VotingCore.new(VotingRegistryInstance.address, {from: testingAccountContractAdmin});
    });

    it("get current admin with getAdmin and get some methods restricted with adminOnly modifier", async () => {
        assert.equal(await VotingCoreInstance.getAdmin(), testingAccountContractAdmin);
        await catchRevert(VotingCoreInstance.setAdmin(testingAccountNewContractAdmin, { from: testingAccountNotContractAdmin }));
        await catchRevert(VotingCoreInstance.setRegistry(NewVotingRegistryInstance.address, { from: testingAccountNotContractAdmin }));
        await catchRevert(VotingCoreInstance.createVoting(optionTitlesHex, expiryBlockNumber, { from: testingAccountNotContractAdmin }));
    });

    it("replace current admin with new one", async () => {
        await VotingCoreInstance.setAdmin(testingAccountNewContractAdmin, { from: testingAccountContractAdmin });
        assert.equal(await VotingCoreInstance.getAdmin(), testingAccountNewContractAdmin);
    });

    it("replace current registry with new one", async () => {
        await VotingCoreInstance.setRegistry(NewVotingRegistryInstance.address, { from: testingAccountContractAdmin });
        assert.equal(await VotingCoreInstance.getRegistry(), NewVotingRegistryInstance.address);
    });

    it("create a vote and deposit it to the registry", async () => {
        await VotingCoreInstance.createVoting(optionTitlesHex, expiryBlockNumber, { from: testingAccountContractAdmin });
        assert.equal(await VotingRegistryInstance.getAmountVotings(), 1);
    });
});