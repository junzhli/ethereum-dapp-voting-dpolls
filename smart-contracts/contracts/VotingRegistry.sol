pragma solidity ^0.5.0;

import "./Voting.sol";

contract VotingRegistry {

  address private admin;
  Voting[] private votings;
  mapping(address => bool) votingIsExisting;

  constructor() public {
    admin = msg.sender;
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

  function depositVoting(Voting _voting) adminOnly public {
    require(votingIsExisting[address(_voting)] != true);
    votings.push(_voting);
    votingIsExisting[address(_voting)] = true;
  }

  function getAmountVotings() public view returns (uint) {
    return votings.length;
  }

  function getVotingItemByIndex(uint _index) public view returns (address) {
    return address(votings[_index]);
  }
}
