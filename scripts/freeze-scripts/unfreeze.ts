import * as fs from "fs"
import * as path from "path"
import { Wallet } from "xrpl"
import { xrplClient } from "../setup/client"
import {
  unfreezeGlobally,
  unfreezeTrustLine
} from "../utils/freeze-util"

async function main() {
  const args = process.argv.slice(2)

  if (args.length < 2) {
    console.error(
      `Usage:\n` +
      `  ts-node unfreeze_token.ts global <TOKEN_CODE>\n` +
      `  ts-node unfreeze_token.ts trust <TOKEN_CODE> <HOLDER_ADDRESS>`
    )
    process.exit(1)
  }

  const [mode, token, holder] = args
  const depPath = path.resolve(__dirname, "../../logs", `Token_${token}_Deployment.json`)

  if (!fs.existsSync(depPath)) {
    console.error("Deployment JSON file not found:", depPath)
    process.exit(1)
  }

  const dep = JSON.parse(fs.readFileSync(depPath, "utf-8"))

  await xrplClient.connect()

  const issuerWallet = Wallet.fromSecret(dep.issuer.secret)

  if (mode === "global") {
    await unfreezeGlobally(
      dep.issuer.address,
      issuerWallet,
      xrplClient
    )
  } else if (mode === "trust") {
    if (!holder) {
      console.error("HOLDER_ADDRESS is required in trust unfreeze mode")
      process.exit(1)
    }
    await unfreezeTrustLine(
      dep.issuer.address,
      holder,
      token,
      issuerWallet,
      xrplClient
    )
  } else {
    console.error("Invalid mode. Use 'global' or 'trust'.")
    process.exit(1)
  }

  await xrplClient.disconnect()
}

if (require.main === module) main()
