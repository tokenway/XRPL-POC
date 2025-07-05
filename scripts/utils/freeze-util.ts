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
import { findTrustline } from "./find-trustline"

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
  const trustline = await findTrustline(
    issuerAddress,
    holderAddress,
    currencyCode,
    xrplClient
  )

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
}

export async function unfreezeTrustLine(
  issuerAddress: string,
  holderAddress: string,
  currencyCode: string,
  issuerWallet: Wallet,
  xrplClient: Client
) {
  const trustline = await findTrustline(
    issuerAddress,
    holderAddress,
    currencyCode,
    xrplClient
  )

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
    Flags: TrustSetFlags.tfClearFreeze
  }

  validate(tx)

  const res = await xrplClient.submitAndWait(tx, { wallet: issuerWallet })

  if (!metaResultOK(res.result.meta)) throw new Error("Individual trust line unfreeze failed")
    console.log(`Trust line unfrozen: ${holderAddress}`)
}
