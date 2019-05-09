pragma solidity ^0.5.0;


contract Voting {
  bytes32 public title;
  uint public optionsAmount;
  address public chairperson;
  uint public expiryBlockNumber;
  bytes32[] private optionTitles;
  mapping(address => uint) private voters;
  mapping(address => bool) private voted;
  mapping(uint => uint) private votes;
  uint public votesAmount;
  
  constructor(bytes32 _title, bytes32[] memory _optionTitles, uint _expiryBlockNumber, address _admin) public {
    require(_expiryBlockNumber > block.number);
    require(_optionTitles.length <= 256 && _optionTitles.length > 1); // we allow a max number of 256 options for each vote
    chairperson = _admin;
    title = _title;
    optionsAmount = _optionTitles.length;
    expiryBlockNumber = _expiryBlockNumber;
    optionTitles = _optionTitles;
    votesAmount = 0;
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
    require(isVoted(_address));
    return voters[_address];
  }

  function getOptionTitleByIndex(uint _index) public view returns (bytes32) {
    require(_optionCheck(_index));
    return optionTitles[_index];
  }

  function getVotesByIndex(uint _index) public view returns (uint) {
    require(_optionCheck(_index));
    return votes[_index];
  }

  function isExpired() public view returns (bool) {
    return (block.number > expiryBlockNumber);
  }
}