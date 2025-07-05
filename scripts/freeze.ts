import * as fs from "fs"
import * as path from "path"
import { freezeGlobally, freezeTrustLine } from "./utils/freeze-util"
import { Wallet } from "xrpl"

async function main() {
  const args = process.argv.slice(2)

  if (args.length < 2) {
    console.error(
      `Usage:\n` +
      `  ts-node freeze_token.ts global <TOKEN_CODE>\n` +
      `  ts-node freeze_token.ts trust <TOKEN_CODE> <HOLDER_ADDRESS>`
    )
    process.exit(1)
  }

  const [mode, token, holder] = args
  const depPath = path.resolve(__dirname, "../logs", `Token_${token}_Deployment.json`)

  if (!fs.existsSync(depPath)) {
    console.error("Deployment JSON file not found:", depPath)
    process.exit(1)
  }

  const dep = JSON.parse(fs.readFileSync(depPath, "utf-8"))

  const issuerWallet = Wallet.fromSecret(dep.issuer.secret)

  if (mode === "global") {
    await freezeGlobally(dep.issuer.address, issuerWallet)
  } else if (mode === "trust") {
    if (!holder) {
      console.error("HOLDER_ADDRESS is required in trust freeze mode")
      process.exit(1)
    }
    await freezeTrustLine(dep.issuer.address, holder, token, issuerWallet)
  } else {
    console.error("Invalid mode. Use 'global' or 'trust'.")
    process.exit(1)
  }
}

if (require.main === module) main()