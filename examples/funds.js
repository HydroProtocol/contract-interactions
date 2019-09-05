/**
 * This example shows how to move funds between your private account and hydro protocol v2 contract.
 *
 * There are 4 places to hold funds.
 *
 *  Name             │ Location         Description
 * ══════════════════╪════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
 *  Ethereum Wallet  │ Private Wallet   Your personal wallet. eg: Metamask.
 *  Trading Balance  │ Hydro Contract   Balances here can be withdrawn at any time. Can be used to place order for spot trading.
 *  Margin Balance   │ Hydro Contract   Balances here can be used as collateral to borrow asset into the corresponding market for margin trading.
 *  Funding Balance  │ Hydro Contract   Balances in funding pool earn interest. Traders can borrow funds from here for margin trading.
 *
 * `Deposit`, `Withdraw`, `Borrow`, `Repay`, `Supply`, `poolWithdraw`, `transfer` are all actions.
 * The table below describes the specific funds moving path of each action.
 *
 *  Actions      │ Funds moving path
 * ══════════════╪═════════════════════════════════════════════════════════════════════════════════════════
 *  deposit      │ from `ethereum wallet` to `trading balance`
 *  withdraw     │ from `trading balance` to `ethereum wallet`
 *  transfer     │ 1) between `trading balance` and `margin balance`. 2) between `different margin balances`
 *  borrow       │ from `funding pool` to `margin balance`
 *  repay        │ from `margin balance` to `funding pool`
 *  supply       │ from `trading balance` to `funding pool`
 *  poolWithdraw │ from `funding pool` to `trading balance`
 *
 * The only contract function we used in this example is `batch` function.
 * You can perform one or several actions in a single batch with specific order.
 *
 * For example, if your want to supply assets from your ethereum wallet into the funding pool,
 * you can combine `deposit` and `supply` actions in a batch to archieve this in a single transaction.
 *
 * Please see `examples` function to see more use cases.
 */

const hydro = require("../src/hydro");
const Ethers = require("ethers");
const { addAccount, web3 } = require("../src/web3");
const encoder = new Ethers.utils.AbiCoder();

const ActionType = {
  Deposit: 0,
  Withdraw: 1,
  Transfer: 2,
  Borrow: 3,
  Repay: 4,
  Supply: 5,
  Unsupply: 6
};

const EtherAssetAddress = "0x000000000000000000000000000000000000000E";

const depositAction = (assetAddress, amount) => {
  return {
    actionType: ActionType.Deposit,
    encodedParams: encoder.encode(
      ["address", "uint256"],
      [assetAddress, amount]
    )
  };
};

const batch = (actions, options) => {
  if (options) {
    return hydro.methods.batch(actions).send(options);
  } else {
    return hydro.methods.batch(actions).send();
  }
};

const deposit = (assetAddress, amount, options) => {
  const actions = [depositAction(assetAddress, amount)];
  return batch(actions, options);
};

const withdrawAction = (assetAddress, amount) => {
  return {
    actionType: ActionType.Withdraw,
    encodedParams: encoder.encode(
      ["address", "uint256"],
      [assetAddress, amount]
    )
  };
};

const withdraw = (assetAddress, amount, options) => {
  const actions = [withdrawAction(assetAddress, amount)];
  return batch(actions, options);
};

const supplyAction = (asset, amount) => {
  return {
    actionType: ActionType.Supply,
    encodedParams: encoder.encode(["address", "uint256"], [asset, amount])
  };
};

const supply = (asset, amount, options) => {
  const actions = [supplyAction(asset, amount)];
  return batch(actions, options);
};

const poolWithdrawAction = (asset, amount) => {
  return {
    actionType: ActionType.Unsupply,
    encodedParams: encoder.encode(["address", "uint256"], [asset, amount])
  };
};

const poolWithdraw = (asset, amount, options) => {
  const actions = [poolWithdrawAction(asset, amount)];
  return batch(actions, options);
};

const borrowAction = (marketID, asset, amount) => {
  return {
    actionType: ActionType.Borrow,
    encodedParams: encoder.encode(
      ["uint16", "address", "uint256"],
      [marketID, asset, amount]
    )
  };
};
const borrow = (marketID, asset, amount, options) => {
  const actions = [borrowAction(marketID, asset, amount)];

  return batch(actions, options);
};

const repayAction = (marketID, asset, amount) => {
  return {
    actionType: ActionType.Repay,
    encodedParams: encoder.encode(
      ["uint16", "address", "uint256"],
      [marketID, asset, amount]
    )
  };
};

const repay = (marketID, asset, amount, options) => {
  const actions = [repayAction(marketID, asset, amount)];
  return batch(actions, options);
};

const BALANCE_PATH_CATEGORY_TRADING = 0;
const BALANCE_PATH_CATEGORY_MARGIN = 1;

const balancePath = (user, category, marketID) => {
  if (category === BALANCE_PATH_CATEGORY_TRADING) {
    return {
      category,
      marketID: 0,
      user
    };
  } else if (category === BALANCE_PATH_CATEGORY_MARGIN) {
    return {
      category,
      marketID,
      user
    };
  } else {
    throw `unknown balance path category ${category}`;
  }
};

const transferAction = (asset, fromPath, toPath, amount) => {
  return {
    actionType: ActionType.Transfer,
    encodedParams: encoder.encode(
      [
        "address",
        "tuple(uint8,uint16,address)",
        "tuple(uint8,uint16,address)",
        "uint256"
      ],
      [
        asset,
        [fromPath.category, fromPath.marketID, fromPath.user],
        [toPath.category, toPath.marketID, toPath.user],
        amount
      ]
    )
  };
};

const transfer = (asset, fromPath, toPath, amount, options) => {
  const actions = [transferAction(asset, fromPath, toPath, amount)];
  return batch(actions, options);
};

const examples = async () => {
  let actions;
  // you neet to add an account into the web3 instance first
  addAccount("your-private-key-here");

  hydro.options.from = web3.eth.defaultAccount;
  hydro.options.gas = 300000;
  hydro.options.gasPrice = 10000000000;

  // Example 1: deposit eth into trading balance
  const amount = "0x1"; // The unit is wei, you should change the value
  const res1 = await deposit(EtherAssetAddress, amount, { value: amount });
  console.log("Exmaple 1:", res1.transactionHash);

  // Example 2: deposit eth into funding pool
  actions = [
    depositAction(EtherAssetAddress, amount),
    supplyAction(EtherAssetAddress, amount)
  ];
  const res2 = await batch(actions, { value: amount });
  console.log("Exmaple 2:", res2.transactionHash);

  // Example 3: move eth from funding pool into market 0 as collateral
  actions = [
    poolWithdrawAction(EtherAssetAddress, amount),
    transferAction(
      EtherAssetAddress,
      balancePath(web3.eth.defaultAccount, BALANCE_PATH_CATEGORY_TRADING),
      balancePath(web3.eth.defaultAccount, BALANCE_PATH_CATEGORY_MARGIN, 0),
      amount
    )
  ];
  const res3 = await batch(actions);
  console.log("Exmaple 3:", res3.transactionHash);

  // Example 4: move eth from market 0 to your ethereum wallet
  actions = [
    transferAction(
      EtherAssetAddress,
      balancePath(web3.eth.defaultAccount, BALANCE_PATH_CATEGORY_MARGIN, 0),
      balancePath(web3.eth.defaultAccount, BALANCE_PATH_CATEGORY_TRADING),
      amount
    ),
    withdrawAction(EtherAssetAddress, amount)
  ];
  const res4 = await batch(actions);
  console.log("Exmaple 4:", res4.transactionHash);
};

// You can run this function
// examples();
