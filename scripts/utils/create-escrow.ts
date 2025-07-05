import { Wallet, Client, EscrowCreate } from "xrpl";

export async function createEscrow(
    walletAddress: string,
    userWallet: Wallet,
    receiverAddress: string,
    issuer: string,
    currencyCode: string,
    amount: string,
    finishTime: string,
    client: Client
): Promise<void> {
    const escrowAmount = {
        "value": amount,
        "currency": currencyCode,
        "issuer": issuer
    };

    // TODO: implement calculation the finishAfter time based on finishTime params.
    const rippleEpochOffset = 946684800;
    const nowUnix = Math.floor(Date.now() / 1000);
    const finishAfter = nowUnix - rippleEpochOffset + 120; // 120 seconds from now

    // const lastLedgerSequence = currentLedgerSequence + 5;

    // TODO: Check typescript support for testnet escrow create object
    const transaction: EscrowCreate = {
        TransactionType: "EscrowCreate",
        Account: walletAddress,
        Amount: escrowAmount,
        Destination: receiverAddress,
        FinishAfter: finishAfter,
        // LastLedgerSequence: lastLedgerSequence,
        Condition: "", // TODO: Check how I can provide condition
    };

    try {
        const result = await client.submitAndWait(transaction, { wallet: userWallet });
        console.log("Escrow Created:", result);
    } catch (error) {
        console.error("Escrow Creation Failed:", error);
    }
}
