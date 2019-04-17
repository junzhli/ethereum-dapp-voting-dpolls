pragma solidity ^0.5.0;


contract Voting {
  uint private optionsAmount;
  address private chairperson;
  uint private expiryBlockNumber;
  mapping(address => uint) private voters;
  mapping(address => bool) private voted;
  mapping(uint => uint) private votes;
  uint private votesAmount;
  

  constructor(uint _optionsAmount, uint _expiryBlockNumber) public {
    require(_expiryBlockNumber > block.number);
    chairperson = msg.sender;
    optionsAmount = _optionsAmount;
    expiryBlockNumber = _expiryBlockNumber;
    votesAmount = 0;
  }

  function isVoted() private view returns (bool) {
    return (voted[msg.sender] == true);
  }

  function _isVoted(address _address) private view returns (bool) {
    return (voted[_address] == true);
  }

  function vote(uint option) public {
    require(!isExpired());
    require(!_isVoted(msg.sender));
    require(option < optionsAmount);
    voters[msg.sender] = option;
    voted[msg.sender] = true;
    votes[option] += 1;
    votesAmount++;
  }

  function getMyOption() public view returns (uint) {
    require(isExpired());
    require(_isVoted(msg.sender));
    return voters[msg.sender];
  }

  function getOptionsAmount() public view returns (uint) {
    return optionsAmount;
  }

  function getVotesByIndex(uint _index) public view returns (uint) {
    require(isExpired());
    require(_index <= optionsAmount);
    return votes[_index];
  }

  function isExpired() public view returns (bool) {
    return (block.number > expiryBlockNumber);
  }

  function currentVotes() public view returns (uint) {
    return votesAmount;
  }
}