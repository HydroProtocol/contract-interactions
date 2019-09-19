const { web3 } = require("./web3");
const { erc20ABI } = require("./abi");

const getErc20TokenContract = address =>
  new web3.eth.Contract(erc20ABI, address);

const getErc20Decimal = async address => {
  if (address.toLowerCase() === "0x000000000000000000000000000000000000000e")
    return 18;
  const erc20 = getErc20TokenContract(address);
  return await erc20.methods.decimals().call();
};

module.exports = {
  getErc20TokenContract,
  getErc20Decimal
};
