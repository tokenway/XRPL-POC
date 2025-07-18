import {
  AccountSet,
  TrustSet,
  Payment,
  AccountSetAsfFlags
} from "xrpl"
import * as fs from "fs"
import * as path from "path"
import { metaResultOK, TF_SET_AUTH } from "./utils/helpers"
import { xrplClient } from "./setup/client"

async function mainCreateIssuer() {
  if (process.argv.length < 4) {
    console.error("Usage: ts-node create_issuer.ts <TOKEN_CODE> <INITIAL_SUPPLY>")
    process.exit(1)
  }
  const token = process.argv[2]
  const supply = process.argv[3]

  await xrplClient.connect()

  // Fund issuer (cold) and distributor (hot)
  const { wallet: issuer } = await xrplClient.fundWallet()
  const { wallet: dist } = await xrplClient.fundWallet()

  console.log("Issuer:", issuer.classicAddress)
  console.log("Distribution:", dist.classicAddress)

  // Enable DefaultRipple & RequireAuth & TrustLineClawback flags on issuer
  const flags: Array<{ flag: number; description: string }> = [
    { flag: AccountSetAsfFlags.asfDefaultRipple, description: "DefaultRipple" },
    { flag: AccountSetAsfFlags.asfRequireAuth, description: "RequireAuth" },
    { flag: AccountSetAsfFlags.asfAllowTrustLineClawback, description: "Clawback" },
  ]

  for (const f of flags) {
    const tx: AccountSet = {
      TransactionType: "AccountSet", 
      Account: issuer.classicAddress,
      SetFlag: f.flag,
    }
    const res = await xrplClient.submitAndWait(tx, { wallet: issuer })
    if (!metaResultOK(res.result.meta))
      throw new Error(`Failed to set ${f.description}`)
  }

  // Trust line dist -> issuer for token
  const trust: TrustSet = {
    TransactionType: "TrustSet",
    Account: dist.classicAddress,
    LimitAmount: {
      currency: token,
      issuer: issuer.classicAddress,
      value: supply,
    },
  }
  const tRes = await xrplClient.submitAndWait(trust, { wallet: dist })
  if (!metaResultOK(tRes.result.meta)) throw new Error("TrustSet failed")

  // Authorize trust line (issuer side)
  const auth: TrustSet = {
    TransactionType: "TrustSet",
    Account: issuer.classicAddress,
    LimitAmount: {
      currency: token,
      issuer: dist.classicAddress,
      value: "0",
    },
    Flags: TF_SET_AUTH,
  }
  const aRes = await xrplClient.submitAndWait(auth, { wallet: issuer })
  if (!metaResultOK(aRes.result.meta)) throw new Error("Auth failed")

  // Issue initial supply to distributor
  const pay: Payment = {
    TransactionType: "Payment",
    Account: issuer.classicAddress,
    Destination: dist.classicAddress,
    Amount: {
      currency: token,
      issuer: issuer.classicAddress,
      value: supply,
    },
  }
  const pRes = await xrplClient.submitAndWait(pay, { wallet: issuer })
  if (!metaResultOK(pRes.result.meta)) throw new Error("Initial issuance failed")

  const info = {
    token,
    supply,
    issuer: { address: issuer.classicAddress, secret: issuer.seed },
    distribution: { address: dist.classicAddress, secret: dist.seed },
  }

  const logsDir = path.resolve(__dirname, "../logs")
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true })
  }

  const filePath = path.join(logsDir, `Token_${token}_Deployment.json`)
  fs.writeFileSync(filePath, JSON.stringify(info, null, 2))
  console.log("Deployment saved at", filePath)

  await xrplClient.disconnect()
}

if (require.main === module) mainCreateIssuer()
