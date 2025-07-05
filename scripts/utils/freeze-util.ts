import {
  AccountSet,
  TrustSet,
  Wallet,
  AccountSetAsfFlags,
  validate,
  Client,
  TrustSetFlags
} from "xrpl"

import { XRPL_FLAGS, XRPL_TX_TYPES } from "../constants"
import { metaResultOK } from "./helpers"

export async function freezeGlobally(
  issuerAddress: string,
  issuerWallet: Wallet,
  xrplClient: Client
) {
  await xrplClient.connect()

  const tx: AccountSet = {
    TransactionType: XRPL_TX_TYPES.ACCOUNT_SET,
    Account: issuerAddress,
    SetFlag: AccountSetAsfFlags.asfGlobalFreeze,
  }

  validate(tx)

  const res = await xrplClient.submitAndWait(tx, { wallet: issuerWallet })

  if (!metaResultOK(res.result.meta)) throw new Error("Global freeze failed")
  console.log("Global freeze enabled.")

  await xrplClient.disconnect()
}

export async function freezeTrustLine(
  issuerAddress: string,
  holderAddress: string,
  currencyCode: string,
  issuerWallet: Wallet,
  xrplClient: Client
) {
  await xrplClient.connect()

  const accountLines = await xrplClient.request({
    "command": "account_lines",
    "account": issuerAddress,
    "peer": holderAddress,
    "ledger_index": "validated"
  })
  const trustlines = accountLines.result.lines
  console.log("Trustlines found: ", trustlines)

  let trustline = null
  for (let i = 0; i < trustlines.length; i++) {
    if (trustlines[i].currency === currencyCode) {
      trustline = trustlines[i]
      break
    }
  }

  if (trustline === null) {
    console.error(`No ${currencyCode} trustline is set between
      ${issuerAddress} and ${holderAddress}`)

    return
  }

  const tx: TrustSet = {
    TransactionType: XRPL_TX_TYPES.TRUST_SET,
    Account: issuerAddress,
    LimitAmount: {
      currency: currencyCode,
      issuer: trustline.account,
      value: trustline.limit,
    },
    Flags: TrustSetFlags.tfSetFreeze,
  }

  validate(tx)

  const res = await xrplClient.submitAndWait(tx, { wallet: issuerWallet })

  if (!metaResultOK(res.result.meta)) throw new Error("Individual trust line freeze failed")
  console.log(`Trust line frozen: ${holderAddress}`)

  await xrplClient.disconnect()
}
