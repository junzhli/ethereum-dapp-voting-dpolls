pragma solidity ^0.5.0;
import './Voting.sol';

contract VotingCore {
  address admin;
  Voting[] votings;

  event newVoting(address _voting);

  constructor() public {
    admin = msg.sender;
  }

  function currentAdmin() public view returns (address) {
    return admin;
  }

  function createVote(uint options, uint expiryBlockNumber) public {
    require(msg.sender == admin);
    Voting voting = new Voting(options, expiryBlockNumber);
    votings.push(voting);
    emit newVoting(address(voting));
  }

  function getAmountVotings() public view returns (uint) {
    return votings.length;
  }

  function getVotingByIndex(uint _index) public view returns (address) {
    require(_index <= votings.length);
    return address(votings[_index]);
  }
}
