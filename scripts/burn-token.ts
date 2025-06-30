import { Wallet, Payment } from "xrpl"
import * as fs from "fs"
import * as path from "path"
import { metaResultOK } from "./utils/helpers"
import { xrplClient } from "./setup/client"

async function mainBurn() {
  if (process.argv.length < 4) {
    console.error("Usage: ts-node burn_token.ts <TOKEN_CODE> <AMOUNT>")
    process.exit(1)
  }
  const token = process.argv[2]
  const burnAmt = process.argv[3]
  const depPath = path.resolve(__dirname, "../logs", `Token_${token}_Deployment.json`)
  const dep = JSON.parse(fs.readFileSync(depPath, "utf8"))

  await xrplClient.connect()
  const distWallet = Wallet.fromSeed(dep.distribution.secret)

  const burn: Payment = {
    TransactionType: "Payment",
    Account: dep.distribution.address,
    Destination: dep.issuer.address,
    Amount: { currency: token, issuer: dep.issuer.address, value: burnAmt },
  }
  const res = await xrplClient.submitAndWait(burn, { wallet: distWallet })
  if (!metaResultOK(res.result.meta)) throw new Error("Burn failed")
  console.log("Burn success.")
  await xrplClient.disconnect()
}

if (require.main === module) mainBurn()
