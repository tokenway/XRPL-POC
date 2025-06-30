import { Client } from "xrpl"

export async function checkBalance(
    userAddress: string,
    tokenCode: string,
    tokenIssuerAddress: string,
    // Connected xrpl client
    xrplClient: Client
) {
    const { result } = await xrplClient.request({
        command: "account_lines",
        account: userAddress,
        peer: tokenIssuerAddress,
        ledger_index: "validated",
    })

    const line = (result.lines as any[]).find(
        (l) => l.currency === tokenCode && l.account === tokenIssuerAddress,
    )

    const balance = line ? line.balance : "0"

    return balance
}
