# XRPL Interaction Scripts

A collection of TypeScript scripts for interacting with custom tokens on the **XRPL (XRP Ledger)**. These scripts allow you to:

- Create issuer and user accounts
- Set up and authorize trustlines
- Transfer tokens between users
- Burn tokens from circulation

---

##  Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [ts-node](https://typestrong.org/ts-node/)
- [xrpl](https://www.npmjs.com/package/xrpl) library

Install dependencies:

```bash
npm install
```

## Scripts Overview

### 1. `create-issuer.ts`

Creates an issuer account with authorization enabled and issues a new token.

**Arguments:**

- `<TOKEN_CODE>` – The token symbol (e.g., `ABC`)
- `<INITIAL_SUPPLY>` – Initial supply to be issued

**Usage:**

```bash
ts-node scripts/create-issuer.ts <TOKEN_CODE> <INITIAL_SUPPLY>
npm run issue <TOKEN_CODE> <INITIAL_SUPPLY>
```

### 2. `create-user.ts`

Creates a new user account and sets up a trustline to the issuer for the specified token.

**Arguments:**

- `<TOKEN_CODE>` – The token symbol (e.g., `ABC`)

**Usage:**

```bash
ts-node scripts/create-user.ts <TOKEN_CODE>
npm run create-user <TOKEN_CODE>
```

### 3. `authorize-trustline.ts`

Authorizes a trustline from the issuer to a user account.

**Arguments:**

- `<TOKEN_CODE>` – The token symbol (e.g., `ABC`)
- `<USER_ADDRESS>` - The XRPL address of the user

**Usage:**

```bash
ts-node scripts/authorize-trustline.ts <TOKEN_CODE> <USER_ADDRESS>

npm run authorize <TOKEN_CODE> <USER_ADDRESS>
```

### 4. `transfer-token.ts`

Transfers a specified amount of tokens from one user to another.

**Arguments:**

- `<TOKEN_CODE>` – The token symbol (e.g., `ABC`)
- `<FROM_ADDRESS>` - The XRPL address of the sender
- `<TO_ADDRESS>` - The XRPL address of the receiver
- `<AMOUNT>` - Amount to transfer

**Usage:**

```bash
ts-node scripts/transfer-token.ts <TOKEN_CODE> <FROM_ADDRESS> <TO_ADDRESS> <AMOUNT>

npm run transfer <TOKEN_CODE> <FROM_ADDRESS> <TO_ADDRESS> <AMOUNT>
```

### 5. `burn-token.ts`

Burns a specified amount of tokens from the issuer's account.

**Arguments:**

- `<TOKEN_CODE>` – The token symbol (e.g., `ABC`)
- `<AMOUNT>` - Amount of tokens to burn

**Usage:**

```bash
ts-node scripts/burn_token.ts <TOKEN_CODE> <AMOUNT>

npm run burn <TOKEN_CODE> <AMOUNT>
```

### 5. `check-balance.ts`

Checks the balance of a specific issued token for a user account on the XRPL.

**Arguments:**

- `<TOKEN_CODE>` – The token symbol (e.g., `ABC`)
- `<USER_ADDRESS>` - Address of the user

**Usage:**

```bash
ts-node scripts/check-balance.ts <TOKEN_CODE> <USER_ADDRESS>

npm run check-balance <TOKEN_CODE> <USER_ADDRESS>
```
