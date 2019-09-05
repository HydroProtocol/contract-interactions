const Web3 = require("web3");
const web3 = new Web3(process.env.ETHEREUM_NODE_URL);

const addAccount = privateKey => {
  const account = web3.eth.accounts.privateKeyToAccount("0x" + privateKey);
  web3.eth.accounts.wallet.add(account);
  web3.eth.defaultAccount = account.address;
};

module.exports = { web3, addAccount };
