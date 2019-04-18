const catchRevert = require('../helper/exception').catchRevert;
const VotingRegistry = artifacts.require('./VotingRegistry');
const Voting = artifacts.require('./Voting');


contract("VotingRegistry", function(accounts) {
    /**
     * Test accounts
     */
    let testingAccountContractAdmin;
    let testingAccountNotContractAdmin;
    let testingAccountNewContractAdmin;

    let VotingRegistryInstance;
    let VotingInstance;
    let Voting2Instance;

    let optionTitles;
    let expiryBlockNumber;

    beforeEach('setup contract for each test', async () => {
        optionTitles = [web3.utils.asciiToHex('Allen'), web3.utils.asciiToHex('Bob'), web3.utils.asciiToHex('Alice')];
        expiryBlockNumber = 999;
        testingAccountContractAdmin = accounts[0];
        testingAccountNotContractAdmin = accounts[1];
        testingAccountNewContractAdmin = accounts[2];
        VotingRegistryInstance = await VotingRegistry.new({from: testingAccountContractAdmin});
        VotingInstance = await Voting.new(optionTitles, expiryBlockNumber, {from: testingAccountContractAdmin});
        Voting2Instance = await Voting.new(optionTitles, expiryBlockNumber, {from: testingAccountContractAdmin});
    });

    it("get current admin with getAdmin and get some methods restricted with adminOnly modifier", async () => {
        assert.equal(await VotingRegistryInstance.getAdmin(), testingAccountContractAdmin);
        await catchRevert(VotingRegistryInstance.setAdmin(testingAccountNewContractAdmin, { from: testingAccountNotContractAdmin }));
        await catchRevert(VotingRegistryInstance.depositVoting(VotingInstance.address, { from: testingAccountNotContractAdmin })); // wierd here: argument type is contract (Voting) but error occured. we put Voting instance's address here and it passes the test
    });

    it("replace current admin with new one", async () => {
        await VotingRegistryInstance.setAdmin(testingAccountNewContractAdmin, { from: testingAccountContractAdmin });
        assert.equal(await VotingRegistryInstance.getAdmin(), testingAccountNewContractAdmin);
    });

    it("deposit votings to the registry", async () => {
        await VotingRegistryInstance.depositVoting(VotingInstance.address, { from: testingAccountContractAdmin })
        assert.equal(await VotingRegistryInstance.getAmountVotings(), 1);
        await catchRevert(VotingRegistryInstance.depositVoting(VotingInstance.address, { from: testingAccountContractAdmin }));
        assert.equal(await VotingRegistryInstance.getAmountVotings(), 1);
        await VotingRegistryInstance.depositVoting(Voting2Instance.address, { from: testingAccountContractAdmin })
        assert.equal(await VotingRegistryInstance.getAmountVotings(), 2);
        assert.equal(await VotingRegistryInstance.getVotingItemByIndex(0), VotingInstance.address);
        assert.equal(await VotingRegistryInstance.getVotingItemByIndex(1), Voting2Instance.address);
    });
});