# Intro

This repository shows how to interactive with hydro v2 margin smart contract.

# Examples

## read or monitor the contract status

This example shows how to read data from contract.

```bash
npm install
npm run example
```

[View example code](./examples/reader.js)

## move funds for programmed trading

There are 4 places to hold funds.

| Name             | Location       | Description                                                                                               |
| ---------------- | -------------- | --------------------------------------------------------------------------------------------------------- |
| Ethereum Wallet  | Private Wallet | Your personal wallet. eg: Metamask.                                                                       |
| Tranding Balance | Hydro Contract | Balances here can be withdrawn at any time. Can be used to place order for spot trading.                  |
| Margin Balance   | Hydro Contract | Balances here can be used as collateral to borrow asset into the corresponding market for margin trading. |
| Funding Balance  | Hydro Contract | Balances in funding pool earn interest. Traders can borrow funds from here for margin trading.            |

There are 7 actions defined in hydro contract for funds operations. They are `Deposit`, `Withdraw`, `Borrow`, `Repay`, `Supply`, `poolWithdraw` and `Transfer`.

| Actions      | Funds moving path                                  |
| ------------ | -------------------------------------------------- |
| deposit      | from `ethereum wallet` to `trading balance`        |
| withdraw     | from `trading balance` to `ethereum wallet`        |
| transfer     | 1) between `trading balance` and `margin balance`. |
|              | 2) between `different margin balances`.            |
| borrow       | from `funding pool` to `margin balance`            |
| repay        | from `margin balance` to `funding pool`            |
| supply       | from `trading balance` to `funding pool`           |
| poolWithdraw | from `funding pool` to `trading balance`           |

![actions](https://raw.githubusercontent.com/hydroprotocol/contract-interations/master/assets/funds-operations.png)

This example will show you how to move your funds and how to perform and combine these actions.

[View example code](./examples/funds.js)

## participate in auctions

[View example code](./examples/auction.js)

# Full Functions List

All external functions are list in this [file](https://github.com/HydroProtocol/protocol/blob/master/contracts/ExternalFunctions.sol).

# License

MIT