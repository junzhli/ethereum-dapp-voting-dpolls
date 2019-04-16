pragma solidity ^0.5.0;

import "./Voting.sol";

// set options
contract VotingRegistry {

  address admin;
  Voting[] votings;

  constructor() public {
    admin = msg.sender;
  }

  function setAdmin(address _admin) public {
    require(msg.sender == admin);
    admin = _admin;
  }

  function depositVoting(Voting _voting) public {
    require(msg.sender == admin);
    votings.push(_voting);
  }

  function getAmountVotings() public view returns (uint) {
    return votings.length;
  }

  function getVotingItemByIndex(uint _index) public view returns (address) {
    return address(votings[_index]);
  }
}
