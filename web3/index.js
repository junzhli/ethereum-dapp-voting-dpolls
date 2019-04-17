const Web3 = require('web3');
const EthereumTx = require('ethereumjs-tx');

const web3 = new Web3('http://127.0.0.1:7545');

const VOTING_CONTRACT_ABI = [
  {
    "inputs": [
      {
        "name": "_options",
        "type": "uint256"
      },
      {
        "name": "_expiryBlockNumber",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "option",
        "type": "uint256"
      }
    ],
    "name": "vote",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "maxOptions",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_index",
        "type": "uint256"
      }
    ],
    "name": "getVotesByIndex",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "isExpired",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "currentVotes",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
]

const VOTING_REGISTRY_CONTRACT_ABI = [
  {
    "inputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "constructor",
    "signature": "constructor"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "getAdmin",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function",
    "signature": "0x6e9960c3"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_admin",
        "type": "address"
      }
    ],
    "name": "setAdmin",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function",
    "signature": "0x704b6c02"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_voting",
        "type": "address"
      }
    ],
    "name": "depositVoting",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function",
    "signature": "0xc5b826d9"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "getAmountVotings",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function",
    "signature": "0x99fb321d"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_index",
        "type": "uint256"
      }
    ],
    "name": "getVotingItemByIndex",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function",
    "signature": "0xd330cebc"
  }
]

const VOTING_CORE_CONTACT_ABI = [
  {
    "inputs": [
      {
        "name": "_votingRegistry",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "_voting",
        "type": "address"
      }
    ],
    "name": "newVoting",
    "type": "event"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "getAdmin",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_admin",
        "type": "address"
      }
    ],
    "name": "setAdmin",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "getRegistry",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_votingRegistry",
        "type": "address"
      }
    ],
    "name": "setRegistry",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "options",
        "type": "uint256"
      },
      {
        "name": "expiryBlockNumber",
        "type": "uint256"
      }
    ],
    "name": "createVote",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }
]

/**
 * Utils - promisify web3 method
 */

function sendSignedTransaction(rawTx, name) {
    return new Promise((res, rej) => {
        web3.eth.sendSignedTransaction(rawTx)
            .on('transactionHash', function(hash){
                console.log('txid ' + name + ': ' + hash);
                res(hash);
            })
            .on('receipt', function(receipt){
                console.log('receipt ' + name + ': ' + JSON.stringify(receipt));
                // res(JSON.stringify(receipt));
            })
            .on('confirmation', function(confirmationNumber, receipt){ 
                console.log('confirmationNumber ' + name + ': ' + confirmationNumber);
            })
            .on('error', error => rej(error)); // If a out of gas error, the second parameter is the receipt.;
    })
}

async function createTransacion(txData, gasLimit, gasPrice, privateKey, accountAddress, targetAddress) {
    const nonce = await web3.eth.getTransactionCount(accountAddress, 'pending');
    const txDetail = {
        nonce: '0x' + nonce.toString(16),
        gasPrice,
        gasLimit,
        to: targetAddress,
        value: '0x0',
        data: txData,
        // EIP 155 chainId - mainnet: 1, ropsten: 3
        chainId: 1
    };
    const tx = new EthereumTx(txDetail);
    tx.sign(privateKey);
    const rawTx = '0x' + tx.serialize().toString('hex');
    return rawTx;
}


// PRIVATE KEY
const PRIVATE_KEY = 'a34d4685d8182384e2012ac74e57faf1837d436e3750c8891b73c7478067973d';
const privateKey = Buffer.from(PRIVATE_KEY, 'hex');
const accountAddress = '0x725eDc0473440786A073684e97dF031eE06E073d';

// Common variable
const gasPrice = '0x165a0bc00'; // 10 gwei: '0x2540be400', 6 gwei: '0x165a0bc00', 4 gwei: '0xee6b2800'

// const VOTING_CORE_CONTRACT
const VOTING_CORE_CONTRACT_ADDRESS = '0x6BCc13E8925d5B845d27502e46E51A8f4856eA72';
const VOTING_CORE = new web3.eth.Contract(VOTING_CORE_CONTACT_ABI, VOTING_CORE_CONTRACT_ADDRESS);

// const VOTING_REGISTRY_CONTRACT
const VOTING_REGISTRY_CONTRACT_ADDRESS = '0xFFc3865c6770B493D7903Fe90942c7E491A95847';
const VOTING_REGISTRY = new web3.eth.Contract(VOTING_REGISTRY_CONTRACT_ABI, VOTING_REGISTRY_CONTRACT_ADDRESS);

// const VOTING_CONTRACT
const VOTING_CONTRACT_ADDRESS = '0x332b934BdF5eB032C0262429E78a919cc507242e';
const VOTING = new web3.eth.Contract(VOTING_CONTRACT_ABI, VOTING_CONTRACT_ADDRESS);

// getAdmin
VOTING_CORE.methods.getAdmin().call()
  .then(value => console.log('current admin: ' + value));

// getCurrentAmountVotings
const getCurrentAmountVotings = async () => {
  const amount = await VOTING_REGISTRY.methods.getAmountVotings().call();
  const awaitingVotings = [];
  for (let index = 0; index < amount; index++) {
      // getVotingItemByIndex
      awaitingVotings.push(VOTING_REGISTRY.methods.getVotingItemByIndex(index).call());
  }
  const votings = await Promise.all(awaitingVotings);
  if (votings.length === 0) console.log('no votings');
  votings.forEach(voting => console.log('votings: ' + voting));
  return amount;
}





// getPastTopics
const TOPIC_NEW_VOTING = '0x07a6f30d578b72ad999db5525776fda98ab2ee752c4b16d8e01d5ae95b9fb58b'; // sha3('newVoting(address)')

// create a vote
const createVote = async (options, expiryBlockNumber) => {
    const txData = VOTING_CORE.methods.createVote(options, expiryBlockNumber).encodeABI();
    const gasLimit = '0x927c0'; // 600000
    const rawTx = await createTransacion(txData, gasLimit, gasPrice, privateKey, accountAddress, VOTING_CORE_CONTRACT_ADDRESS);
    return sendSignedTransaction(rawTx, 'create-voting');
}

// const run = async () => {
//   let currentAmountVotings = await getCurrentAmountVotings();
//   console.log('currentAmountVotings: ' + currentAmountVotings);
//   const options = 3;
//   const expiryBlockNumber = await web3.eth.getBlockNumber() + 5;
//   console.log('current expiryBlockNumber ' + expiryBlockNumber);
//   const txid = await createVote(options, expiryBlockNumber)
//   console.log('success');
//   console.log('txid: ' + txid);
//   const receipt = await web3.eth.getTransactionReceipt(txid);
//   console.log('got receipt: ' + JSON.stringify(receipt));
//   currentAmountVotings = await getCurrentAmountVotings();
//   console.log('currentAmountVotings: ' + currentAmountVotings);
// }

// run()
//   .then(() => {
//     console.log('run success');
//   })
//   .catch((error) => {
//     console.log('run error');
//     console.log(error);
//   })

// vote

// vote for a voting
const vote = async (option) => {
  const txData = VOTING.methods.vote(option).encodeABI();
  const gasLimit = '0x927c0'; // 600000
  const rawTx = await createTransacion(txData, gasLimit, gasPrice, privateKey, accountAddress, VOTING_CONTRACT_ADDRESS);
  return sendSignedTransaction(rawTx, 'vote');
}

const run = async () => {
  const option = 1;
  console.log('myVote: ' + option + ' for ' + VOTING_CONTRACT_ADDRESS);
  const txid = await vote(option)
  console.log('success');
  console.log('txid: ' + txid);
  const receipt = await web3.eth.getTransactionReceipt(txid);
  console.log('got receipt: ' + JSON.stringify(receipt));
  
}

run()
  .then(() => {
    console.log('run success');
  })
  .catch((error) => {
    console.log('run error');
    console.log(error);
  })

// currentVotes
VOTING.methods.currentVotes().call()
  .then(value => console.log('current votes: ' + value + ' for ' + VOTING_CONTRACT_ADDRESS))

// isExpired
VOTING.methods.isExpired().call()
  .then(value => console.log('isExpired: ' + value + ' for ' + VOTING_CONTRACT_ADDRESS))

