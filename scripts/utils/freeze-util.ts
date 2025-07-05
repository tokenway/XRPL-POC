import { xrplClient } from "../setup/client"
import { XRPL_FLAGS, XRPL_TX_TYPES } from "../constants"
import { AccountSet, TrustSet, Wallet, AccountSetAsfFlags, validate } from "xrpl"
import { metaResultOK } from "./helpers"

export async function freezeGlobally(issuerAddress: string, issuerWallet: Wallet) {
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
  issuerWallet: Wallet
) {
  await xrplClient.connect()

  const tx: TrustSet = {
    TransactionType: XRPL_TX_TYPES.TRUST_SET,
    Account: issuerAddress,
    LimitAmount: {
      currency: currencyCode,
      issuer: holderAddress,
      value: "0",
    },
    Flags: XRPL_FLAGS.TF_SET_FREEZE,
  }

  const res = await xrplClient.submitAndWait(tx, { wallet: issuerWallet })

  if (!metaResultOK(res.result.meta)) throw new Error("Individual trust line freeze failed")
  console.log(`Trust line frozen: ${holderAddress}`)

  await xrplClient.disconnect()
}
