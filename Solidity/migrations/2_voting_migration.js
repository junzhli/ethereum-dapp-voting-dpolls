var VotingRegistry = artifacts.require('VotingRegistry');
var VotingCore = artifacts.require('VotingCore');

module.exports = function(deployer, network, accounts) {
    deployer.deploy(VotingRegistry)
        .then(() => {
            const votingRegistryAddress = VotingRegistry.address;
            return deployer.deploy(VotingCore, votingRegistryAddress);
        })
        .then(() => {
            console.log('success');
        })
  };