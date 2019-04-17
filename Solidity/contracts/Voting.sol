pragma solidity ^0.5.0;


contract Voting {
  uint options;
  address chairperson;
  uint expiryBlockNumber;
  mapping(address => uint) voters;
  mapping(address => bool) voted;
  mapping(uint => uint) votes;
  uint votesAmount;
  

  constructor(uint _options, uint _expiryBlockNumber) public {
    chairperson = msg.sender;
    options = _options;
    expiryBlockNumber = _expiryBlockNumber;
    votesAmount = 0;
  }

  function isVoted(address _address) public view returns (bool) {
    return (voted[_address] == true);
  }

  function vote(uint option) public {
    require(!isExpired());
    require(isVoted(msg.sender));
    require(option <= options);
    voters[msg.sender] = option;
    voted[msg.sender] = true;
    votes[option] += 1;
    votesAmount++;
  }

  function getMyOption() public view returns (uint) {
    require(isExpired());
    require(isVoted(msg.sender));
    return voters[msg.sender];
  }

  function maxOptions() public view returns (uint) {
    return options;
  }

  function getVotesByIndex(uint _index) public view returns (uint) {
    require(isExpired());
    require(_index <= options);
    return votes[_index];
  }

  function isExpired() public view returns (bool) {
    return (block.number > expiryBlockNumber);
  }

  function currentVotes() public view returns (uint) {
    return votesAmount;
  }
}