import { abi } from "./abi";

export const BASE_URL = "https://justins-macbook-pro.tailadeea5.ts.net";
export const PINATA_GATEWAY_URL = "azure-tiny-tahr-350.mypinata.cloud";

// export const PARALLAX_CONTRACT = "0x8Fa7f8338727C00f05987cef8d587220a22e61B0";
export const PARALLAX_CONTRACT = "0x1385A7d244516C8256e3C37b02345ba6A2871152";
export const USDC_CONTRACT = "0x06DB1989Bd9396bFbFDB5EAe0A5b7629857C37B7"
export const wagmiContractConfig = {
    address: PARALLAX_CONTRACT,
    abi: abi,
  } as const;