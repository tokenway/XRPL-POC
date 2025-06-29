import {
  Client,
  AccountSet,
  TrustSet,
  Payment,
} from "xrpl"
import * as fs from "fs"
import * as path from "path"
import { metaResultOK, TF_SET_AUTH } from "./utils/helpers"

async function mainCreateIssuer() {
  if (process.argv.length < 4) {
    console.error("Usage: ts-node create_issuer.ts <TOKEN_CODE> <INITIAL_SUPPLY>")
    process.exit(1)
  }
  const token = process.argv[2]
  const supply = process.argv[3]

  const client = new Client("wss://s.altnet.rippletest.net:51233")
  await client.connect()

  // Fund issuer (cold) and distributor (hot)
  const { wallet: issuer } = await client.fundWallet()
  const { wallet: dist } = await client.fundWallet()

  console.log("Issuer:", issuer.classicAddress)
  console.log("Distribution:", dist.classicAddress)

  // Enable DefaultRipple (8) & RequireAuth (2) flags on issuer
  const flags: Array<{ flag: number; description: string }> = [
    { flag: 8, description: "DefaultRipple" },
    { flag: 2, description: "RequireAuth" },
  ]

  for (const f of flags) {
    const tx: AccountSet = {
      TransactionType: "AccountSet",
      Account: issuer.classicAddress,
      SetFlag: f.flag,
    }
    const res = await client.submitAndWait(tx, { wallet: issuer })
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
  const tRes = await client.submitAndWait(trust, { wallet: dist })
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
  const aRes = await client.submitAndWait(auth, { wallet: issuer })
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
  const pRes = await client.submitAndWait(pay, { wallet: issuer })
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

  await client.disconnect()
}

if (require.main === module) mainCreateIssuer()
