import { sdk } from "@farcaster/frame-sdk";

export default function useShare() {
  const shareInvestigation = async () => {
    await sdk.actions.openUrl(
      `https://warpcast.com/~/compose?text=${encodeURIComponent(
        "I just signed up to investigate a crime. Join Parallax and see if you can solve the crime before me!"
      )}&embeds[]=https://parallax.cool`
    );
  };

  return { shareInvestigation };
}
