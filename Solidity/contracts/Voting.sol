pragma solidity ^0.5.0;


contract Voting {
  uint options;
  address chairperson;
  uint expiryBlockNumber;
  mapping(address => uint) voters;
  mapping(address => bool) voted;
  mapping(uint => uint) votes;
  

  constructor(uint _options, uint _expiryBlockNumber) public {
    chairperson = msg.sender;
    options = _options;
    expiryBlockNumber = _expiryBlockNumber;
  }

  function vote(uint option) public {
    require(!isExpired());
    require(option <= options);
    voters[msg.sender] = option;
    voted[msg.sender] = true;
    votes[option] += 1;
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
}
