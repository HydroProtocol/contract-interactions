const { hydroABI } = require("./abi");
const { web3 } = require("./web3");

module.exports = new web3.eth.Contract(
  hydroABI,
  "0x241e82c79452f51fbfc89fac6d912e021db1a3b7"
);
