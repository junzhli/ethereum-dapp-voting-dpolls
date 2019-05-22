export const getEtherscanTxURL = (networkID: string | undefined, txid: string) => {
    // 1: "Mainnet",
    // 3: "Ropsten",
    // 4: "Rinkeby",
    // 42: "Kovan",
    if (networkID === "1") {
        return "https://etherscan.io/tx/" + txid;
    } else if (networkID === "3") {
        return "https://ropsten.etherscan.io/tx/" + txid;
    } else if (networkID === "4") {
        return "https://rinkeby.etherscan.io/tx/" + txid;
    } else if (networkID === "42") {
        return "https://kovan.etherscan.io/tx/" + txid;
    } else {
        return null;
    }
};
