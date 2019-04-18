pragma solidity ^0.5.0;


contract Voting {
  uint private optionsAmount;
  address private chairperson;
  uint private expiryBlockNumber;
  bytes32[] optionTitles;
  mapping(address => uint) private voters;
  mapping(address => bool) private voted;
  mapping(uint => uint) private votes;
  uint private votesAmount;
  

  constructor(bytes32[] memory _optionTitles, uint _expiryBlockNumber) public {
    require(_expiryBlockNumber > block.number);
    require(_optionTitles.length <= 256); // we allow a max number of 256 options for each vote
    chairperson = msg.sender;
    optionsAmount = _optionTitles.length;
    expiryBlockNumber = _expiryBlockNumber;
    votesAmount = 0;
    
    for (uint i = 0; i < _optionTitles.length; i++) {
      optionTitles.push(_optionTitles[i]);
    }
  }

  function isVoted() private view returns (bool) {
    return (voted[msg.sender] == true);
  }

  function _isVoted(address _address) private view returns (bool) {
    return (voted[_address] == true);
  }

  function _optionCheck(uint _option) private view returns (bool) {
    return (_option < optionsAmount);
  }

  function vote(uint option) public {
    require(!isExpired());
    require(!_isVoted(msg.sender));
    require(_optionCheck(option));
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

  function getOptionTitleByIndex(uint _index) public view returns (bytes32) {
    require(_optionCheck(_index));
    return optionTitles[_index];
  }

  function getVotesByIndex(uint _index) public view returns (uint) {
    require(isExpired());
    require(_optionCheck(_index));
    return votes[_index];
  }

  function isExpired() public view returns (bool) {
    return (block.number > expiryBlockNumber);
  }

  function currentVotes() public view returns (uint) {
    return votesAmount;
  }
}