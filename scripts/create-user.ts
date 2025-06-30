import * as fs from "fs"
import * as path from "path"
import { xrplClient } from "./setup/client"
import { createTrustline } from "./utils/create-trustline"

// TODO: accept trustline limit from argv if needed
async function mainCreateUser() {
  if (process.argv.length < 3) {
    console.error("Usage: ts-node create_user.ts <TOKEN_CODE>")
    process.exit(1)
  }
  const token = process.argv[2]
  // NOTE: directory existence is safe because this script is supposed to be run after create-issuer script.
  const logsDir = path.resolve(__dirname, "../logs")
  const depPath = path.join(logsDir, `Token_${token}_Deployment.json`)

  if (!fs.existsSync(depPath)) {
    throw new Error("Run create_issuer first (deployment file not found).")
  }
  const deployment = JSON.parse(fs.readFileSync(depPath, "utf8"))

  await xrplClient.connect()
  const { wallet: user } = await xrplClient.fundWallet()
  console.log("User:", user.classicAddress)

  await createTrustline(
    user.classicAddress,
    user,
    deployment.issuer.address,
    token,
    xrplClient
  )

  const filePath = path.join(logsDir, `User_${token}_${user.classicAddress}.json`)
  fs.writeFileSync(
    filePath,
    JSON.stringify({ address: user.classicAddress, secret: user.seed }, null, 2)
  )
  console.log("User file saved.")
  await xrplClient.disconnect()
}

if (require.main === module) mainCreateUser()
