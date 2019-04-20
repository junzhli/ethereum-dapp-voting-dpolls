pragma solidity ^0.5.0;


contract Voting {
  bytes32 private title;
  uint private optionsAmount;
  address private chairperson;
  uint private expiryBlockNumber;
  bytes32[] private optionTitles;
  mapping(address => uint) private voters;
  mapping(address => bool) private voted;
  mapping(uint => uint) private votes;
  uint private votesAmount;
  

  constructor(bytes32 _title, bytes32[] memory _optionTitles, uint _expiryBlockNumber) public {
    require(_expiryBlockNumber > block.number);
    require(_optionTitles.length <= 256 && _optionTitles.length > 0); // we allow a max number of 256 options for each vote
    chairperson = tx.origin;
    title = _title;
    optionsAmount = _optionTitles.length;
    expiryBlockNumber = _expiryBlockNumber;
    votesAmount = 0;
    
    for (uint i = 0; i < _optionTitles.length; i++) {
      optionTitles.push(_optionTitles[i]);
    }
  }

  function getChairperson() public view returns (address) {
    return chairperson;
  }

  function isVoted(address _address) public view returns (bool) {
    return (voted[_address] == true);
  }

  function _optionCheck(uint _option) private view returns (bool) {
    return (_option < optionsAmount);
  }

  function vote(uint option) public {
    require(!isExpired());
    require(!isVoted(msg.sender));
    require(_optionCheck(option));
    voters[msg.sender] = option;
    voted[msg.sender] = true;
    votes[option] += 1;
    votesAmount++;
  }

  function getMyOption(address _address) public view returns (uint) {
    require(isExpired());
    require(isVoted(_address));
    return voters[_address];
  }

  function getTitle() public view returns (bytes32) {
    return title;
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