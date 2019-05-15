export const VOTING_CORE_ABI = [
  {
    constant: true,
    inputs: [],
    name: "votingHostRegistry",
    outputs: [
      {
        name: "",
        type: "address",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
    signature: "0x57b6dc0c",
  },
  {
    constant: true,
    inputs: [],
    name: "depositAccount",
    outputs: [
      {
        name: "",
        type: "address",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
    signature: "0x63b9bee7",
  },
  {
    constant: false,
    inputs: [
      {
        name: "_admin",
        type: "address",
      },
    ],
    name: "setAdmin",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
    signature: "0x704b6c02",
  },
  {
    constant: true,
    inputs: [],
    name: "votingRegistry",
    outputs: [
      {
        name: "",
        type: "address",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
    signature: "0xc1738ef8",
  },
  {
    constant: true,
    inputs: [],
    name: "admin",
    outputs: [
      {
        name: "",
        type: "address",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
    signature: "0xf851a440",
  },
  {
    inputs: [
      {
        name: "_votingRegistry",
        type: "address",
      },
      {
        name: "_votingHostRegistry",
        type: "address",
      },
      {
        name: "_depositAccount",
        type: "address",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "constructor",
    signature: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: "_voting",
        type: "address",
      },
    ],
    name: "newVoting",
    type: "event",
    signature: "0x07a6f30d578b72ad999db5525776fda98ab2ee752c4b16d8e01d5ae95b9fb58b",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: "_votingRegistry",
        type: "address",
      },
    ],
    name: "ejectVotingRegistry",
    type: "event",
    signature: "0xcb9d239d0800141e96b585605b24e33234e03263878fa46d105ca2359d9529f7",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: "_votingHostRegistry",
        type: "address",
      },
    ],
    name: "ejectVotingHostRegistry",
    type: "event",
    signature: "0xe702b52dbb1c5b93962129932162629673ea14a2bdd49f6f3ad163fee2325f9c",
  },
  {
    constant: false,
    inputs: [
      {
        name: "_depositAccount",
        type: "address",
      },
    ],
    name: "setDepositAccount",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
    signature: "0xae63c62e",
  },
  {
    constant: false,
    inputs: [
      {
        name: "_votingHostRegistry",
        type: "address",
      },
    ],
    name: "setVotingHostRegistry",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
    signature: "0x2b555662",
  },
  {
    constant: false,
    inputs: [
      {
        name: "_votingRegistry",
        type: "address",
      },
    ],
    name: "setVotingRegistry",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
    signature: "0x3b87d4c4",
  },
  {
    constant: true,
    inputs: [],
    name: "getAmountVotings",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
    signature: "0x99fb321d",
  },
  {
    constant: true,
    inputs: [
      {
        name: "_index",
        type: "uint256",
      },
    ],
    name: "getVotingItemByIndex",
    outputs: [
      {
        name: "",
        type: "address",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
    signature: "0xd330cebc",
  },
  {
    constant: true,
    inputs: [
      {
        name: "_address",
        type: "address",
      },
    ],
    name: "getMembership",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
    signature: "0x34c5a044",
  },
  {
    constant: true,
    inputs: [
      {
        name: "_address",
        type: "address",
      },
    ],
    name: "getQuota",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
    signature: "0x43a2a302",
  },
  {
    constant: false,
    inputs: [
      {
        name: "title",
        type: "bytes32",
      },
      {
        name: "optionTitles",
        type: "bytes32[]",
      },
      {
        name: "expiryBlockNumber",
        type: "uint256",
      },
    ],
    name: "createVoting",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
    signature: "0x76df6394",
  },
  {
    constant: false,
    inputs: [],
    name: "applyAsHost",
    outputs: [],
    payable: true,
    stateMutability: "payable",
    type: "function",
    signature: "0x4c98ab23",
  },
  {
    constant: false,
    inputs: [],
    name: "withdrawEther",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
    signature: "0x7362377b",
  },
  {
    constant: false,
    inputs: [],
    name: "ejectRegistry",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
    signature: "0x3f7bbb41",
  },
];

export const VOTING_ABI = [
  {
    constant: true,
    inputs: [],
    name: "votesAmount",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "chairperson",
    outputs: [
      {
        name: "",
        type: "address",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "title",
    outputs: [
      {
        name: "",
        type: "bytes32",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "expiryBlockNumber",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "optionsAmount",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        name: "_title",
        type: "bytes32",
      },
      {
        name: "_optionTitles",
        type: "bytes32[]",
      },
      {
        name: "_expiryBlockNumber",
        type: "uint256",
      },
      {
        name: "_admin",
        type: "address",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    constant: true,
    inputs: [
      {
        name: "_address",
        type: "address",
      },
    ],
    name: "isVoted",
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "option",
        type: "uint256",
      },
    ],
    name: "vote",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      {
        name: "_address",
        type: "address",
      },
    ],
    name: "getMyOption",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      {
        name: "_index",
        type: "uint256",
      },
    ],
    name: "getOptionTitleByIndex",
    outputs: [
      {
        name: "",
        type: "bytes32",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      {
        name: "_index",
        type: "uint256",
      },
    ],
    name: "getVotesByIndex",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "isExpired",
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
];
