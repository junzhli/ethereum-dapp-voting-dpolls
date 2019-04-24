const catchRevert = require('./helper/exception').catchRevert;
const { Membership, MembershipPricing } = require('./constant');
const VotingHostRegistry = artifacts.require('./VotingHostRegistry');
const VotingRegistry = artifacts.require('./VotingRegistry');
const VotingCore = artifacts.require('./VotingCore');


contract("VotingCore", function(accounts) {
    /**
     * Test accounts
     */
    let testingAccountContractAdmin;
    let testingAccountNotContractAdmin;
    let testingAccountNewContractAdmin;
    let testingAccountVotingHost;
    let testingDepositAccount;
    let testingNewDepositAccount;

    let VotingHostRegistryInstance;
    let NewVotingHostRegistryInstance;
    let VotingRegistryInstance;
    let NewVotingRegistryInstance;
    let VotingCoreInstance;

    let title;
    let titleHex;
    let optionTitles;
    let optionTitlesHex;
    let expiryBlockNumber;

    beforeEach('setup contract for each test', async () => {
        title = 'Who is the best?';
        titleHex = web3.utils.utf8ToHex(title);
        optionTitles = ['Allen', 'Bob', 'Alice'];
        optionTitlesHex = optionTitles.map(title => web3.utils.utf8ToHex(title));
        expiryBlockNumber = 999;
        testingAccountContractAdmin = accounts[0];
        testingAccountNotContractAdmin = accounts[1];
        testingAccountNewContractAdmin = accounts[2];
        testingAccountVotingHost = accounts[3];
        testingDepositAccount = accounts[4];
        testingNewDepositAccount = accounts[5];
        VotingHostRegistryInstance = await VotingHostRegistry.new({from: testingAccountContractAdmin});
        NewVotingHostRegistryInstance = await VotingHostRegistry.new({from: testingAccountContractAdmin});
        VotingRegistryInstance = await VotingRegistry.new({from: testingAccountContractAdmin});
        NewVotingRegistryInstance = await VotingRegistry.new({from: testingAccountContractAdmin});
        VotingCoreInstance = await VotingCore.new(VotingRegistryInstance.address, VotingHostRegistryInstance.address, testingDepositAccount, {from: testingAccountContractAdmin});
        await VotingRegistryInstance.setAdmin(VotingCoreInstance.address, {from: testingAccountContractAdmin});
        await VotingHostRegistryInstance.setAdmin(VotingCoreInstance.address, {from: testingAccountContractAdmin});
    });

    it("get current admin with getAdmin and get some methods restricted with adminOnly modifier", async () => {
        assert.equal(await VotingCoreInstance.admin(), testingAccountContractAdmin);
        await catchRevert(VotingCoreInstance.setAdmin(testingAccountNewContractAdmin, { from: testingAccountNotContractAdmin }));
        await catchRevert(VotingCoreInstance.setVotingRegistry(NewVotingRegistryInstance.address, { from: testingAccountNotContractAdmin }));
        await catchRevert(VotingCoreInstance.setDepositAccount(testingNewDepositAccount, { from: testingAccountNotContractAdmin }));
        await catchRevert(VotingCoreInstance.setVotingHostRegistry(NewVotingHostRegistryInstance.address, { from: testingAccountNotContractAdmin }));
        await catchRevert(VotingCoreInstance.createVoting(titleHex, optionTitlesHex, expiryBlockNumber, { from: testingAccountNotContractAdmin }));
    });

    it("replace current admin with new one", async () => {
        await VotingCoreInstance.setAdmin(testingAccountNewContractAdmin, { from: testingAccountContractAdmin });
        assert.equal(await VotingCoreInstance.admin(), testingAccountNewContractAdmin);
    });

    it("replace current registry with new one", async () => {
        await VotingCoreInstance.setVotingRegistry(NewVotingRegistryInstance.address, { from: testingAccountContractAdmin });
        assert.equal(await VotingCoreInstance.votingRegistry(), NewVotingRegistryInstance.address);
    });

    it("replace current deposit account with new one", async () => {
        await VotingCoreInstance.setDepositAccount(testingNewDepositAccount, { from: testingAccountContractAdmin });
        assert.equal(await VotingCoreInstance.depositAccount(), testingNewDepositAccount);
    });

    it("replace current hosts registry with new one", async () => {
        await VotingCoreInstance.setVotingHostRegistry(NewVotingHostRegistryInstance.address, { from: testingAccountContractAdmin });
        assert.equal(await VotingCoreInstance.votingHostRegistry(), NewVotingHostRegistryInstance.address);
    });

    it("create a vote from a non-voting host", async () => {
        await catchRevert(VotingCoreInstance.createVoting(titleHex, optionTitlesHex, expiryBlockNumber, { from: testingAccountContractAdmin }));
    });

    it("apply for a 'CITIZEN' voting host, create a vote, deposit it to the registry and withdraw ethers", async () => {
        const fee = MembershipPricing.CITIZEN; // ether
        const balanceBeforeApply = await web3.eth.getBalance(VotingCoreInstance.address);
        await VotingCoreInstance.applyAsHost({ from: testingAccountVotingHost, value: web3.utils.toWei(web3.utils.toBN(String(fee)), 'ether')});
        assert.equal(await VotingCoreInstance.getMembership(testingAccountVotingHost, { from: testingAccountVotingHost }), Membership.CITIZEN);
        await VotingCoreInstance.createVoting(titleHex, optionTitlesHex, expiryBlockNumber, { from: testingAccountVotingHost });
        assert.equal(await VotingRegistryInstance.getAmountVotings(), 1);
        assert.equal(await web3.eth.getBalance(VotingCoreInstance.address) - balanceBeforeApply, fee * (10 ** 18));
        const balanceBeforeWithdraw = await web3.eth.getBalance(testingDepositAccount);
        await VotingCoreInstance.withdrawEther({ from: testingAccountContractAdmin });
        assert.equal(await web3.eth.getBalance(testingDepositAccount) - balanceBeforeWithdraw, fee * (10 ** 18));
    });
});