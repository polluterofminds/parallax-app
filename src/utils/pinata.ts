import { PinataSDK } from "pinata";
import { PINATA_GATEWAY_URL } from "./config";

export const pinata = new PinataSDK({
  pinataJwt: "",
  pinataGateway: PINATA_GATEWAY_URL,
});
