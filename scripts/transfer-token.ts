import { Client as C4, Wallet as W4, Payment as P4 } from "xrpl"
import * as fs from "fs"
import * as path from "path"
import { metaResultOK as ok4 } from "./helpers"

async function mainTransfer() {
  if (process.argv.length < 6) {
    console.error("Usage: ts-node transfer_token.ts <TOKEN_CODE> <FROM_ADDRESS> <TO_ADDRESS> <AMOUNT>")
    process.exit(1)
  }
  const [token, from, to, amount] = process.argv.slice(2)
  const depPath = path.resolve(__dirname, "../logs", `Token_${token}_Deployment.json`)
  const dep = JSON.parse(fs.readFileSync(depPath, "utf8"))

  let secret: string | undefined
  if (from === dep.distribution.address) secret = dep.distribution.secret
  if (from === dep.issuer.address) secret = dep.issuer.secret
  if (!secret) throw new Error("Secret for FROM address not found in deployment file.")

  const client = new C4("wss://s.altnet.rippletest.net:51233")
  await client.connect()
  const srcWallet = W4.fromSeed(secret)

  const pay: P4 = {
    TransactionType: "Payment",
    Account: from,
    Destination: to,
    Amount: { currency: token, issuer: dep.issuer.address, value: amount },
  }
  const res = await client.submitAndWait(pay, { wallet: srcWallet })
  if (!ok4(res.result.meta)) throw new Error("Transfer failed")
  console.log("Transfer success.")
  await client.disconnect()
}

if (require.main === module) mainTransfer()
