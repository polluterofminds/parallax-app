import { useConnect } from "wagmi";
import { v4 as uuidv4 } from "uuid";
import { sdk } from "@farcaster/frame-sdk";
//  @ts-expect-error no types needed
import jwt from "jwt-encode";

export default function useAuthToken() {
    const { connect, connectors } = useConnect(); // Assuming this is your hook
    
    const generateToken = async () => {
      const nonce = uuidv4().split("-").join("d");
      connect({ connector: connectors[0] });
      const signature = await sdk.actions.signIn({
        nonce,
      });
      
      const authData = {
        message: signature.message,
        signature: signature.signature,
        nonce: nonce,
      };
      
      const secret = "NOT_SECRET";
      return jwt(authData, secret);
    };
    
    return { generateToken };
  }