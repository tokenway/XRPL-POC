import { Client } from "xrpl"

export async function findTrustline(
    issuerAddress: string,
    holderAddress: string,
    currencyCode: string,
    xrplClient: Client
  ) {
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

    return trustline
  }