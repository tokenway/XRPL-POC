import { Wallet, TrustSet } from "xrpl"
import * as fs from "fs"
import * as path from "path"
import { metaResultOK, TF_SET_AUTH as AUTH } from "./utils/helpers"
import { xrplClient } from "./setup/client"

async function mainAuth() {
  if (process.argv.length < 4) {
    console.error("Usage: ts-node authorize_trustline.ts <TOKEN_CODE> <USER_ADDRESS>")
    process.exit(1)
  }
  const token = process.argv[2]
  const userAddr = process.argv[3]
  const logPath = path.resolve(__dirname, `../logs/Token_${token}_Deployment.json`)
  const dep = JSON.parse(fs.readFileSync(logPath, "utf8"))

  await xrplClient.connect()
  const issuerWallet = Wallet.fromSeed(dep.issuer.secret)

  const auth: TrustSet = {
    TransactionType: "TrustSet",
    Account: issuerWallet.classicAddress,
    LimitAmount: { currency: token, issuer: userAddr, value: "0" },
    Flags: AUTH,
  }
  const res = await xrplClient.submitAndWait(auth, { wallet: issuerWallet })

  if (!metaResultOK(res.result.meta)) throw new Error("Auth failed")
  console.log("Trust line authorized.")
  await xrplClient.disconnect()
}

if (require.main === module) mainAuth()
