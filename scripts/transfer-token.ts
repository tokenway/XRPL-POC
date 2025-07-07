import { Wallet, Payment } from "xrpl"
import * as fs from "fs"
import * as path from "path"
import { metaResultOK } from "./utils/helpers"
import { xrplClient } from "./setup/client"

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

  await xrplClient.connect()
  const srcWallet = Wallet.fromSeed(secret)

  const pay: Payment = {
    TransactionType: "Payment",
    Account: from,
    Destination: to,
    Amount: { currency: token, issuer: dep.issuer.address, value: amount },
  }
  const res = await xrplClient.submitAndWait(pay, { wallet: srcWallet })
  if (!metaResultOK(res.result.meta)) throw new Error("Transfer failed")
  console.log("Transfer success.")
  await xrplClient.disconnect()
}

if (require.main === module) mainTransfer()
