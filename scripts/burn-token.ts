import { Client as C5, Wallet as W5, Payment as P5 } from "xrpl"
import * as fs from "fs"
import * as path from "path"
import { metaResultOK as ok5 } from "./helpers"

async function mainBurn() {
  if (process.argv.length < 4) {
    console.error("Usage: ts-node burn_token.ts <TOKEN_CODE> <AMOUNT>")
    process.exit(1)
  }
  const token = process.argv[2]
  const burnAmt = process.argv[3]
  const depPath = path.resolve(__dirname, "../logs", `Token_${token}_Deployment.json`)
  const dep = JSON.parse(fs.readFileSync(depPath, "utf8"))

  const client = new C5("wss://s.altnet.rippletest.net:51233")
  await client.connect()
  const distWallet = W5.fromSeed(dep.distribution.secret)

  const burn: P5 = {
    TransactionType: "Payment",
    Account: dep.distribution.address,
    Destination: dep.issuer.address,
    Amount: { currency: token, issuer: dep.issuer.address, value: burnAmt },
  }
  const res = await client.submitAndWait(burn, { wallet: distWallet })
  if (!ok5(res.result.meta)) throw new Error("Burn failed")
  console.log("Burn success.")
  await client.disconnect()
}

if (require.main === module) mainBurn()
