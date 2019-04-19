const catchRevert = require('../helper/exception').catchRevert;
const VotingHostsRegistry = artifacts.require('./VotingHostsRegistry');


contract("VotingHostsRegistry", function(accounts) {
    /**
     * Constants
     */
    const Membership = {
        NOBODY: 0,
        CITIZEN: 1,
        DIAMOND: 2
    }
    
    /**
     * Test accounts
     */
    let testingAccountContractAdmin;
    let testingAccountNotContractAdmin;
    let testingAccountNewContractAdmin;
    let testingAccountNotMembership;
    let testingAccountWithCitizenMembership;
    let testingAccountWithDiamondMembership;

    let VotingHostsRegistryInstance;

    // let title;
    // let titleHex;
    // let optionTitles;
    // let optionTitlesHex;
    // let expiryBlockNumber;

    beforeEach('setup contract for each test', async () => {
        testingAccountContractAdmin = accounts[0];
        testingAccountNotContractAdmin = accounts[1];
        testingAccountNewContractAdmin = accounts[2];
        testingAccountNotMembership = accounts[3];
        testingAccountWithCitizenMembership = accounts[4];
        testingAccountWithDiamondMembership = accounts[5];
        VotingHostsRegistryInstance = await VotingHostsRegistry.new({from: testingAccountContractAdmin});
    });

    it("get current admin with getAdmin and get some methods restricted with adminOnly modifier", async () => {
        assert.equal(await VotingHostsRegistryInstance.getAdmin(), testingAccountContractAdmin);
        await catchRevert(VotingHostsRegistryInstance.setAdmin(testingAccountNewContractAdmin, { from: testingAccountNotContractAdmin }));
        await catchRevert(VotingHostsRegistryInstance.depositHost(testingAccountWithCitizenMembership, Membership.CITIZEN, { from: testingAccountNotContractAdmin }));
        await catchRevert(VotingHostsRegistryInstance.setRecordForHost(testingAccountWithCitizenMembership, { from: testingAccountNotContractAdmin }));
    });

    it("replace current admin with new one", async () => {
        await VotingHostsRegistryInstance.setAdmin(testingAccountNewContractAdmin, { from: testingAccountContractAdmin });
        assert.equal(await VotingHostsRegistryInstance.getAdmin(), testingAccountNewContractAdmin);
    });

    it("deposit a host with 'CITIZEN' membership to the registry, set a few records until it downgrades the membership", async () => {
        await VotingHostsRegistryInstance.depositHost(testingAccountWithCitizenMembership, Membership.CITIZEN, { from: testingAccountContractAdmin });
        assert.equal(await VotingHostsRegistryInstance.isHost(testingAccountWithCitizenMembership), true);
        assert.equal(await VotingHostsRegistryInstance.getMembership(testingAccountWithCitizenMembership), Membership.CITIZEN);
        
        // start setting 10 records
        for (let i = 0; i < 10; i++) {
            await VotingHostsRegistryInstance.setRecordForHost(testingAccountWithCitizenMembership);
        }
        
        assert.equal(await VotingHostsRegistryInstance.getMembership(testingAccountWithCitizenMembership), Membership.NOBODY);
    });

    it("deposit a host with 'DIAMOND' membership to the registry", async () => {
        await VotingHostsRegistryInstance.depositHost(testingAccountWithDiamondMembership, Membership.DIAMOND, { from: testingAccountContractAdmin });
        assert.equal(await VotingHostsRegistryInstance.isHost(testingAccountWithDiamondMembership), true);
        assert.equal(await VotingHostsRegistryInstance.getMembership(testingAccountWithDiamondMembership), Membership.DIAMOND);
    });

    it("check if a non-voting host exists, set a record for a non-voting host, and it results an error", async () => {
        assert.equal(await VotingHostsRegistryInstance.getMembership(testingAccountNotMembership), Membership.NOBODY);
        assert.equal(await VotingHostsRegistryInstance.isHost(testingAccountNotMembership), false);
        await catchRevert(VotingHostsRegistryInstance.setRecordForHost(testingAccountNotMembership));
    });
});