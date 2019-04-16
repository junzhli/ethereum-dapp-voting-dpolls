pragma solidity ^0.5.0;
import './Voting.sol';
import './VotingRegistry.sol';

contract VotingCore {
  address admin;
  address votingRegistry;

  event newVoting(address _voting);

  constructor(address _votingRegistry) public {
    admin = msg.sender;
    votingRegistry = _votingRegistry;
  }

  function currentAdmin() public view returns (address) {
    return admin;
  }



  function createVote(uint options, uint expiryBlockNumber) public {
    require(msg.sender == admin);
    Voting voting = new Voting(options, expiryBlockNumber);
    VotingRegistry registry = VotingRegistry(votingRegistry);
    registry.depositVoting(voting);
    emit newVoting(address(voting));
  }
}
