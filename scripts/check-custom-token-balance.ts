import * as fs from "fs"
import * as path from "path"
import { xrplClient } from "./setup/client"
import { checkBalance } from "./utils/check-balance"

async function main() {
  if (process.argv.length < 4) {
    console.error("Usage: ts-node check_balance.ts <TOKEN_CODE> <USER_ADDRESS>")
    process.exit(1)
  }

  const [token, userAddr] = process.argv.slice(2)

  const logsDir = path.resolve(__dirname, "../logs")
  const depPath = path.join(logsDir, `Token_${token}_Deployment.json`)

  if (!fs.existsSync(depPath)) {
    console.error(`Deployment file not found: ${depPath}`)
    console.error("Run create_issuer.ts first, or check the token code.")
    process.exit(1)
  }
  const deployment = JSON.parse(fs.readFileSync(depPath, "utf8"))
  const issuerAddr: string = deployment.issuer.address

  await xrplClient.connect()

  const balance = await checkBalance(
    userAddr,
    token,
    issuerAddr,
    xrplClient
  )

  console.log(`Balance of ${token} for ${userAddr}: ${balance}`)

  await xrplClient.disconnect()
}

if (require.main === module) main()
