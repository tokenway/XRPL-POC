import { Wallet, Clawback, Client } from "xrpl"
import * as fs from "fs"
import * as path from "path"
import { xrplClient } from "./setup/client"
import { metaResultOK } from "./utils/helpers"

async function mainClawback() {
  if (process.argv.length < 5) {
    console.error("Usage: ts-node clawback.ts <AMOUNT> <TOKEN_CODE> <USER_ADDRESS>")
    process.exit(1)
  }

  const amount = process.argv[2]
  const token = process.argv[3]
  const userAddr = process.argv[4]
  const logPath = path.resolve(__dirname, `../logs/Token_${token}_Deployment.json`)

  if (!fs.existsSync(logPath)) {
    console.error(`Log file not found: ${logPath}`)
    process.exit(1)
  }

  const dep = JSON.parse(fs.readFileSync(logPath, "utf8"))
  const issuerSecret = dep.issuer.secret
  const issuerAddress = dep.issuer.address

  await xrplClient.connect()
  const issuerWallet = Wallet.fromSeed(issuerSecret)

  const clawbackTx: Clawback = {
    TransactionType: "Clawback",
    Account: issuerAddress,
    Amount: {
      currency: token,
      issuer: issuerAddress,
      value: amount,
    },
    Holder: userAddr
  }

  const result = await xrplClient.submitAndWait(clawbackTx, { wallet: issuerWallet })

  if (!metaResultOK(result.result.meta)) {
    throw new Error("Clawback failed")
  }

  console.log(`Clawed back ${amount} ${token} from ${userAddr}`)
  await xrplClient.disconnect()
}

if (require.main === module) mainClawback()
