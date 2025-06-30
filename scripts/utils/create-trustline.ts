import { Client, TrustSet, Wallet } from "xrpl"
import { metaResultOK } from "./helpers"

export async function createTrustline(
    userAddress: string,
    userWallet: Wallet,
    tokenIssuerAddress: string,
    tokenCode: string,
    xrplClient: Client
) {
    const trust: TrustSet = {
        TransactionType: "TrustSet",
        Account: userAddress,
        LimitAmount: {
            currency: tokenCode,
            issuer: tokenIssuerAddress,
            // Big value for test
            value: "100000000"
        }
    }

    const res = await xrplClient.submitAndWait(trust, { wallet: userWallet })
    if (!metaResultOK(res.result.meta)) {
        throw new Error("Trust line against USDC create failed")
    } else {
        console.log("Trustline against USDC created!")
    }
}
