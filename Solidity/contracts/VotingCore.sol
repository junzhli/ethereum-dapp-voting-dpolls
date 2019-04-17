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

  modifier adminOnly() {
    require(msg.sender == admin || tx.origin == admin);
    _;
  }

  function getAdmin() public view returns (address) {
    return admin;
  }

  function setAdmin(address _admin) adminOnly public {
    admin = _admin;
  }

  function getRegistry() public view returns (address) {
    return votingRegistry;
  }

  function setRegistry(address _votingRegistry) adminOnly public {
    votingRegistry = _votingRegistry;
  }

  function createVote(uint options, uint expiryBlockNumber) adminOnly public {
    Voting voting = new Voting(options, expiryBlockNumber);
    VotingRegistry registry = VotingRegistry(votingRegistry);
    registry.depositVoting(voting);
    emit newVoting(address(voting));
  }
}
