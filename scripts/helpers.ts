export function metaResultOK(meta: unknown): boolean {
    return (
        meta !== undefined &&
        typeof meta !== "string" &&
        (meta as { TransactionResult?: string }).TransactionResult === "tesSUCCESS"
    )
}

export const TF_SET_AUTH = 0x00010000
