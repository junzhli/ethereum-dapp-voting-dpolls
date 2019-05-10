const catchRevert = require('./helper/exception').catchRevert;
const { Membership, MembershipQuota } = require('./constant');
const VotingHostRegistry = artifacts.require('./VotingHostRegistry');


contract("VotingHostRegistry", function(accounts) {  
    /**
     * Test accounts
     */
    let testingAccountContractAdmin;
    let testingAccountNotContractAdmin;
    let testingAccountNewContractAdmin;
    let testingAccountNotMembership;
    let testingAccountWithCitizenMembership;
    let testingAccountWithDiamondMembership;

    let VotingHostRegistryInstance;

    beforeEach('setup contract for each test', async () => {
        testingAccountContractAdmin = accounts[0];
        testingAccountNotContractAdmin = accounts[1];
        testingAccountNewContractAdmin = accounts[2];
        testingAccountNotMembership = accounts[3];
        testingAccountWithCitizenMembership = accounts[4];
        testingAccountWithDiamondMembership = accounts[5];
        VotingHostRegistryInstance = await VotingHostRegistry.new({from: testingAccountContractAdmin});
    });

    it("get current admin with getAdmin and get some methods restricted with adminOnly modifier", async () => {
        assert.equal(await VotingHostRegistryInstance.admin(), testingAccountContractAdmin);
        await catchRevert(VotingHostRegistryInstance.setAdmin(testingAccountNewContractAdmin, { from: testingAccountNotContractAdmin }));
        await catchRevert(VotingHostRegistryInstance.depositHost(testingAccountWithCitizenMembership, Membership.CITIZEN, { from: testingAccountNotContractAdmin }));
        await catchRevert(VotingHostRegistryInstance.setRecordForHost(testingAccountWithCitizenMembership, { from: testingAccountNotContractAdmin }));
    });

    it("replace current admin with new one", async () => {
        await VotingHostRegistryInstance.setAdmin(testingAccountNewContractAdmin, { from: testingAccountContractAdmin });
        assert.equal(await VotingHostRegistryInstance.admin(), testingAccountNewContractAdmin);
    });

    it("deposit a host with 'CITIZEN' membership to the registry, set a few records until it downgrades the membership", async () => {
        await VotingHostRegistryInstance.depositHost(testingAccountWithCitizenMembership, Membership.CITIZEN, { from: testingAccountContractAdmin });
        assert.equal(await VotingHostRegistryInstance.isHost(testingAccountWithCitizenMembership), true);
        assert.equal(await VotingHostRegistryInstance.getMembership(testingAccountWithCitizenMembership), Membership.CITIZEN);
        assert.equal(await VotingHostRegistryInstance.getQuota(testingAccountWithCitizenMembership), MembershipQuota.CITIZEN);

        // check quota left while during the time of setting 10 records
        const checkPoint = 4;
        for (let i = 0; i < checkPoint; i++) {
            await VotingHostRegistryInstance.setRecordForHost(testingAccountWithCitizenMembership);
        }
        assert.equal(await VotingHostRegistryInstance.getQuota(testingAccountWithCitizenMembership), MembershipQuota.CITIZEN - checkPoint);
        for (let i = checkPoint; i < 10; i++) {
            await VotingHostRegistryInstance.setRecordForHost(testingAccountWithCitizenMembership);
        }
        
        assert.equal(await VotingHostRegistryInstance.getMembership(testingAccountWithCitizenMembership), Membership.NOBODY);
        await catchRevert(VotingHostRegistryInstance.getQuota(testingAccountWithCitizenMembership));
    });

    it("deposit a host with 'DIAMOND' membership to the registry", async () => {
        await VotingHostRegistryInstance.depositHost(testingAccountWithDiamondMembership, Membership.DIAMOND, { from: testingAccountContractAdmin });
        assert.equal(await VotingHostRegistryInstance.isHost(testingAccountWithDiamondMembership), true);
        assert.equal(await VotingHostRegistryInstance.getMembership(testingAccountWithDiamondMembership), Membership.DIAMOND);
    });

    it("check if a non-voting host exists, set a record for a non-voting host, and it results an error", async () => {
        assert.equal(await VotingHostRegistryInstance.getMembership(testingAccountNotMembership), Membership.NOBODY);
        assert.equal(await VotingHostRegistryInstance.isHost(testingAccountNotMembership), false);
        await catchRevert(VotingHostRegistryInstance.setRecordForHost(testingAccountNotMembership));
    });
});