var VotingHostsRegistry = artifacts.require('VotingHostsRegistry');
var VotingRegistry = artifacts.require('VotingRegistry');
var VotingCore = artifacts.require('VotingCore');

module.exports = function(deployer, network, accounts) {
    let votingHostsRegistryAddress;
    let votingRegistryAddress;
    const depositAccountAddress = accounts[5];

    deployer.deploy(VotingHostsRegistry)
        .then(() => {
            votingHostsRegistryAddress = VotingHostsRegistry.address;
            return deployer.deploy(VotingRegistry);
        })
        .then(() => {
            votingRegistryAddress = VotingRegistry.address;
            return deployer.deploy(VotingCore, votingRegistryAddress, votingHostsRegistryAddress, depositAccountAddress);
        })
        .then(() => {
            console.log('success');
        })
        .catch((error) => {
            console.log('failed');
            console.log(error);
        })
  };