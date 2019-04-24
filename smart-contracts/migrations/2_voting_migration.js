var VotingHostRegistry = artifacts.require('VotingHostRegistry');
var VotingRegistry = artifacts.require('VotingRegistry');
var VotingCore = artifacts.require('VotingCore');

module.exports = function(deployer, network, accounts) {
    let votingHostRegistryAddress;
    let votingRegistryAddress;
    const depositAccountAddress = accounts[5];

    deployer.deploy(VotingHostRegistry)
        .then(() => {
            votingHostRegistryAddress = VotingHostRegistry.address;
            return deployer.deploy(VotingRegistry);
        })
        .then(() => {
            votingRegistryAddress = VotingRegistry.address;
            return deployer.deploy(VotingCore, votingRegistryAddress, votingHostRegistryAddress, depositAccountAddress);
        })
        .then(() => {
            console.log('success');
        })
        .catch((error) => {
            console.log('failed');
            console.log(error);
        })
  };