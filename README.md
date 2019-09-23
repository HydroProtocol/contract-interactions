# Intro

This repository shows how to interact with the hydro v2 margin [smart contract](https://github.com/HydroProtocol/protocol).

# Examples

## 1. Read or Monitor Contract Status

This example shows how to read data from contract.

```bash
npm install
npm run example
```

[View example code](./examples/reader.js)

## 2. Contract Structure and Moving Assets

### Contract Structure

The hydro v2 margin contract supports three primary functions: spot trading, margin trading, and lending. To avoid collision of actions between these areas, each of these functions actually has a separate balance within the contract (referred to as "Accounts"). Additionally, you can also interact with the hydro margin contract through an external Ethereum wallet (such as MetaMask).

The following table highlights this division of asset allocation for interacting with the hydro v2 margin contract:

| Name            | Location       | Description                                                                                               |
| --------------- | -------------- | --------------------------------------------------------------------------------------------------------- |
| Ethereum Wallet | Private Wallet | Your personal wallet. eg: MetaMask.                                                                       |
| Trading Balance | Hydro Contract | Balances here can be withdrawn at any time. Can be used to place orders for spot trading.                  |
| Margin Balance  | Hydro Contract | Balances here can be used as collateral to borrow assets into the corresponding market for margin trading. Each market has a separate margin balance (ETH-DAI margin balances are separate from ETH-USDT margin balances) |
| Funding Balance | Hydro Contract | Balances in funding pools earn interest. Traders can borrow funds from here for margin trading.            |

### Moving Assets

There are 7 unique actions defined in the hydro v2 margin contract for moving your assets between your external wallet and the hydro accounts. These actions are: `Deposit`, `Withdraw`, `Borrow`, `Repay`, `Supply`, `poolWithdraw` and `Transfer`, described in the table below.

| Action       | How Assets Are Moved                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------ |
| deposit      | from `ethereum wallet` to `trading balance`                                                      |
| withdraw     | from `trading balance` to `ethereum wallet`                                                      |
| transfer     | 1) between `trading balance` and `margin balance`.<br /> 2) between `different margin balances`. |
| borrow       | from `funding pool` to `margin balance`                                                          |
| repay        | from `margin balance` to `funding pool`                                                          |
| supply       | from `trading balance` to `funding pool`                                                         |
| poolWithdraw | from `funding pool` to `trading balance`                                                         |

The following picture depicts a high level overview of how asset moving actions interact with each area of the contract:

![actions](https://raw.githubusercontent.com/hydroprotocol/contract-interations/master/assets/funds-operations.png)

This code example will show you how to move your funds and how to combine these actions.

[View example code](./examples/funds.js)

## 3. Participating in auctions

Hydro Margin liquidations are handled through the form of [dutch auctions](https://ddex.zendesk.com/hc/en-us/articles/360035813033-How-Liquidations-Work). We will provide more detailed guides on participating in these auctions in the future, but for now if you'd like to get involved please check out the following code example:

[View example code](./examples/auction.js)

# Full List of Functions

All external functions are listed in this [file](https://github.com/HydroProtocol/protocol/blob/master/contracts/ExternalFunctions.sol).

# License

MIT
