export const XRPL_FLAGS = {
    // AccountSet Flags
    DEFAULT_RIPPLE: 0x00000008,
    REQUIRE_AUTH: 0x00000002,
    DISALLOW_XRP: 0x00080000,
    GLOBAL_FREEZE: 0x00400000,
    NO_FREEZE: 0x00200000,
  
    // TrustSet Flags
    TF_SET_AUTH: 0x00010000,
    TF_SET_NO_RIPPLE: 0x00020000,
    TF_CLEAR_NO_RIPPLE: 0x00040000,
    TF_SET_FREEZE: 0x00100000,
    TF_CLEAR_FREEZE: 0x00200000,
  }
  
  export const XRPL_TX_TYPES = {
    ACCOUNT_SET: "AccountSet",
    TRUST_SET: "TrustSet",
    PAYMENT: "Payment",
  }
  
  export const XRPL_META = {
    SUCCESS: "tesSUCCESS",
  }
  