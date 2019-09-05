const { web3 } = require("./web3");
const { erc20ABI } = require("./abi");

const getErc20TokenContract = address =>
  new web3.eth.Contract(erc20ABI, address);

module.exports = { getErc20TokenContract };
