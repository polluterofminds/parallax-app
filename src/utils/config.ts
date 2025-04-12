import { abi } from "./abi";

export const BASE_URL = "https://justins-macbook-pro.tailadeea5.ts.net";
export const PINATA_GATEWAY_URL = "azure-tiny-tahr-350.mypinata.cloud";

export const PARALLAX_CONTRACT = "0x8e8f1660da1935EF48BEb669463f426A5acE0CB5";
export const USDC_CONTRACT = "0x06DB1989Bd9396bFbFDB5EAe0A5b7629857C37B7"
export const wagmiContractConfig = {
    address: PARALLAX_CONTRACT,
    abi: abi,
  } as const;