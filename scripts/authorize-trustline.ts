import { Client as C3, Wallet as W3, TrustSet as T3 } from "xrpl"
import * as fs from "fs"
import * as path from "path"
import { metaResultOK as ok3, TF_SET_AUTH as AUTH } from "./helpers"

async function mainAuth() {
  if (process.argv.length < 4) {
    console.error("Usage: ts-node authorize_trustline.ts <TOKEN_CODE> <USER_ADDRESS>")
    process.exit(1)
  }
  const token = process.argv[2]
  const userAddr = process.argv[3]
  const logPath = path.resolve(__dirname, `../logs/Token_${token}_Deployment.json`)
  const dep = JSON.parse(fs.readFileSync(logPath, "utf8"))

  const client = new C3("wss://s.altnet.rippletest.net:51233")
  await client.connect()
  const issuerWallet = W3.fromSeed(dep.issuer.secret)

  const auth: T3 = {
    TransactionType: "TrustSet",
    Account: issuerWallet.classicAddress,
    LimitAmount: { currency: token, issuer: userAddr, value: "0" },
    Flags: AUTH,
  }
  const res = await client.submitAndWait(auth, { wallet: issuerWallet })

  if (!ok3(res.result.meta)) throw new Error("Auth failed")
  console.log("Trust line authorized.")
  await client.disconnect()
}

if (require.main === module) mainAuth()
