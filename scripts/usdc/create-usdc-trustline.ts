import {
    Client,
    Wallet
} from "xrpl"
import * as fs from "fs/promises"
import * as path from "path"

import { USDC_ISSUER, USDC_CODE } from "../constants"
import { createTrustline } from "../utils/create-trustline"

async function mainCreateUSDCTrustline() {
    if (process.argv.length < 3) {
        console.error("Usage: ts-node create-usdc-trustline.ts <USER_ADDRESS>")
        process.exit(1)
    }

    const userAddress = process.argv[2]

    const logsDir = path.resolve(__dirname, "../../logs")
    const files = await fs.readdir(logsDir)
    const fileName = files.find(
        (f) => f.toLowerCase().endsWith(`${userAddress.toLowerCase()}.json`)
    )

    if (!fileName) {
        throw new Error(
            `No JSON file ending in “…${userAddress}.json” found in ${logsDir}`
        )
    }

    const filePath = path.join(logsDir, fileName)
    const raw = await fs.readFile(filePath, "utf8")
    const userJson = JSON.parse(raw)

    const walletAddress = userJson.address
    const walletSecret = userJson.secret

    const userWallet = Wallet.fromSecret(walletSecret)

    const client = new Client("wss://s.altnet.rippletest.net:51233")
    await client.connect()

    await createTrustline(
        walletAddress,
        userWallet,
        USDC_ISSUER,
        USDC_CODE,
        client
    )
    
    await client.disconnect()
}

if (require.main === module) mainCreateUSDCTrustline()
