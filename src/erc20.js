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

const getErc20Symbol = async address => {
  if (address.toLowerCase() === "0x000000000000000000000000000000000000000e")
    return "ETH";
  if (address.toLowerCase() === "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359")
    return "DAI";
  const erc20 = getErc20TokenContract(address);
  return await erc20.methods.symbol().call();
};

module.exports = {
  getErc20TokenContract,
  getErc20Decimal,
  getErc20Symbol
};
