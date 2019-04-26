pragma solidity ^0.5.0;
import "./baseContracts/Permissioned.sol";
import "./Voting.sol";

contract VotingRegistry is Permissioned {
  Voting[] private votings;
  mapping(address => bool) private votingIsExisting;

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
