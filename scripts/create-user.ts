import {
  Client as Client2,
  TrustSet as TrustSet2,
} from "xrpl"
import * as fs2 from "fs"
import * as path from "path"
import { metaResultOK as ok2 } from "./helpers"

// TODO: accept trustline limit from argv if needed
async function mainCreateUser() {
  if (process.argv.length < 3) {
    console.error("Usage: ts-node create_user.ts <TOKEN_CODE>")
    process.exit(1)
  }
  const token = process.argv[2]
  const depFile = `Token_${token}_Deployment.json`
  if (!fs2.existsSync(depFile)) throw new Error("Run create_issuer first.")
  const deployment = JSON.parse(fs2.readFileSync(depFile, "utf8"))

  const client = new Client2("wss://s.altnet.rippletest.net:51233")
  await client.connect()
  const { wallet: user } = await client.fundWallet()
  console.log("User:", user.classicAddress)

  const trust: TrustSet2 = {
    TransactionType: "TrustSet",
    Account: user.classicAddress,
    LimitAmount: {
      currency: token,
      issuer: deployment.issuer.address,
      value: "1000000000",
    },
  }
  const res = await client.submitAndWait(trust, { wallet: user })
  if (!ok2(res.result.meta)) throw new Error("Trust line create failed")

  // NOTE: directory existence is safe because this script is supposed to be run after create-issuer script.
  const logsDir = path.resolve(__dirname, "../logs")

  const filePath = path.join(logsDir, `User_${token}_${user.classicAddress}.json`)
  fs2.writeFileSync(
    filePath,
    JSON.stringify({ address: user.classicAddress, secret: user.seed }, null, 2)
  )
  console.log("User file saved.")
  await client.disconnect()
}

if (require.main === module) mainCreateUser()
