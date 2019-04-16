var Voting = artifacts.require("./Voting.sol");
var VotingCore = artifacts.require('./VotingCore.sol');

const sellingPrice = 1000000000000000; //WEI
const productName = 'Calculus Textbook';

module.exports = function(deployer, network, accounts) {
//   deployer.deploy(Voting, accounts[0],sellingPrice,productName).then(function() {
//   	return deployer.deploy(SellingGenerator)
//   })
  deployer.deploy(VotingCore).then(function() {
  	console.log('success');
  })
};