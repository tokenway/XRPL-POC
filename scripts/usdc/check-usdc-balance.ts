import { Client } from "xrpl"
import { USDC_CODE, USDC_ISSUER } from "../constants"
import { checkBalance } from "../utils/check-balance"

async function main() {
    if (process.argv.length < 3) {
        console.error("Usage: ts-node check-usdc-balance.ts <USER_ADDRESS>")
        process.exit(1)
    }

    const userAddress = process.argv[2]

    const client = new Client("wss://s.altnet.rippletest.net:51233")
    await client.connect()

    const balance = await checkBalance(
        userAddress,
        USDC_CODE,
        USDC_ISSUER,
        client
    )
    console.log(`Balance of USDC for ${userAddress}: ${balance}`)

    await client.disconnect()
}

if (require.main === module) main()
