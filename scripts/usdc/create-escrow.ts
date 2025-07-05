import { Wallet } from "xrpl"
import * as fs from "fs/promises"
import * as path from "path"

import { USDC_ISSUER, USDC_CODE } from "../constants"
import { createEscrow } from "../utils/create-escrow"
import { xrplClient } from "../setup/client"

async function mainCreateUSDCEscrow() {
    if (process.argv.length < 6) {
        console.error("Usage: ts-node create-usdc-escrow.ts <SENDER_ADDRESS> <RECEIVER_ADDRESS> <ESCROW_AMOUNT> <ESCROW_FINISH_TIME>")
        process.exit(1)
    }

    const senderAddress = process.argv[2]
    const receiverAddress = process.argv[3]
    const escrowAmount = process.argv[4]
    const escrowFinishTime = process.argv[5]

    const logsDir = path.resolve(__dirname, "../../logs")
    const files = await fs.readdir(logsDir)
    const fileName = files.find(
        (f) => f.toLowerCase().endsWith(`${senderAddress.toLowerCase()}.json`)
    )

    if (!fileName) {
        throw new Error(
            `No JSON file ending in “…${senderAddress}.json” found in ${logsDir}`
        )
    }

    const filePath = path.join(logsDir, fileName)
    const raw = await fs.readFile(filePath, "utf8")
    const userJson = JSON.parse(raw)

    const walletAddress = userJson.address
    const walletSecret = userJson.secret

    const userWallet = Wallet.fromSecret(walletSecret)

    await xrplClient.connect()

    await createEscrow(
        walletAddress,
        userWallet,
        receiverAddress,
        USDC_ISSUER,
        USDC_CODE,
        escrowAmount,
        escrowFinishTime,
        xrplClient
    )

    await xrplClient.disconnect()
}

if (require.main === module) mainCreateUSDCEscrow()
