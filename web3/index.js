const Web3 = require('web3');
const EthereumTx = require('ethereumjs-tx');

const web3 = new Web3('http://127.0.0.1:7545');

const VOTING_CONTRACT_ABI = [
    {
      "inputs": [
        {
          "name": "_options",
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
    }
  ]

const VOTING_CORE_CONTACT_ABI = [
    {
      "inputs": [],
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
      "name": "currentAdmin",
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
          "name": "options",
          "type": "uint256"
        }
      ],
      "name": "createVote",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
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
      "name": "getVotingByIndex",
      "outputs": [
        {
          "name": "",
          "type": "address"
        }
      ],
      "payable": false,
      "stateMutability": "view",
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
const PRIVATE_KEY = '04955ab7dfa6fbdc782ad9becffd3492b8d4f2491a39a9243039297bea49c47b';
const privateKey = Buffer.from(PRIVATE_KEY, 'hex');
const accountAddress = '0x6f88ea734a8Bd77910bD17078a58Bdc92498870a';

// Common variable
const gasPrice = '0x165a0bc00'; // 10 gwei: '0x2540be400', 6 gwei: '0x165a0bc00', 4 gwei: '0xee6b2800'

// const VOTING_CORE_CONTRACT
const VOTING_CORE_CONTRACT_ADDRESS = '0xbF9cc15EB5abfB7c954592552817b6724269513e';
const VOTING_CORE = new web3.eth.Contract(VOTING_CORE_CONTACT_ABI, VOTING_CORE_CONTRACT_ADDRESS);

// getCurrentAdmin
VOTING_CORE.methods.currentAdmin().call()
  .then(value => console.log('current admin: ' + value));

// getCurrentAmountVotings
VOTING_CORE.methods.getAmountVotings().call()
  .then(amount => {
        const awaitingVotings = [];
        for (let index = 0; index < amount; index++) {
            // getVotingByIndex
            awaitingVotings.push(VOTING_CORE.methods.getVotingByIndex(index).call());
        }
        return Promise.all(awaitingVotings);
    })
  .then(votings => {
        votings.forEach(voting => console.log(voting));
  })




// getPastTopics
const TOPIC_NEW_VOTING = '0x07a6f30d578b72ad999db5525776fda98ab2ee752c4b16d8e01d5ae95b9fb58b'; // sha3('newVoting(address)')

// create a vote
const createVote = async (options) => {
    const txData = VOTING_CORE.methods.createVote(options).encodeABI();
    const gasLimit = '0x927c0'; // 600000
    const rawTx = await createTransacion(txData, gasLimit, gasPrice, privateKey, accountAddress, VOTING_CORE_CONTRACT_ADDRESS);
    return sendSignedTransaction(rawTx, 'create-voting');
}


// const options = 3;
// createVote(options)
//     .then(async value => {
//         console.log('success');
//         console.log(value);
//         const txid = value;
//         const receipt = await web3.eth.getTransactionReceipt(txid);
//         console.log('got receipt: ' + JSON.stringify(receipt));
//         return 
//     })
//     .catch(error => {
//         console.log('failed');
//         console.log(error);
//     })


