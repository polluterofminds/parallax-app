import { useEffect, useState } from "react";
import { FCProfile } from "../types";
import {
  useAccount,
  useConnect,
  useReadContracts,
  useWriteContract,
} from "wagmi";
import { abi, usdcAbi } from "../utils/abi";
import { parseUnits } from "viem";
import {
  PARALLAX_CONTRACT,
  USDC_CONTRACT,
  wagmiContractConfig,
} from "../utils/config";
import { Link, useNavigate } from "react-router";
import { sdk } from "@farcaster/frame-sdk";

type OnboardingProps = {
  playersLeftToRegister: number;
  hasDeposited: boolean;
  setHasDeposited: (deposited: boolean) => void;
  setPlayersLeftToRegister: (playerCount: number) => void;
};

const Onboarding = ({
  playersLeftToRegister,
  hasDeposited,
  setHasDeposited,
  setPlayersLeftToRegister,
}: OnboardingProps) => {
  const [user, setUser] = useState<FCProfile>({
    username: "",
    displayName: "",
    fid: "",
  });

  const {
    data: usdcApprovalHash,
    isPending: usdcApprovalPending,
    writeContract: writeUSDCContract,
    error: usdcError,
  } = useWriteContract();
  const {
    data: depositHash,
    isPending: isDepositPending,
    error: parallaxError,
    writeContract: writeParallaxContract,
  } = useWriteContract();
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const navigate = useNavigate();

  useEffect(() => {
    const userProfile = localStorage.getItem("fc-profile-data");
    if (userProfile) {
      setUser(JSON.parse(userProfile));
    }
  }, []);

  const {
    data,
    error,
    isPending: isReadPending,
  } = useReadContracts({
    contracts: [
      {
        ...wagmiContractConfig,
        functionName: "getRemainingPlayersNeeded",
        args: [],
      },
    ],
    query: {
      enabled: !!address && !!hasDeposited,
    },
  });
  const [remainingPlayersNeeded]: any = data || [];

  useEffect(() => {
    if (error)
      alert(
        `Error: ${(error as BaseError).shortMessage || error.message}`
      );
    if (remainingPlayersNeeded) {
      const playersNeeded = remainingPlayersNeeded.result;

      setPlayersLeftToRegister(playersNeeded);

      if (playersNeeded < 1) {
        navigate("/case-file");
      }
    }
  }, [remainingPlayersNeeded, address, error]);

  useEffect(() => {
    if (!isDepositPending && depositHash) {
      // Now we need to check the contract again and update state
      setHasDeposited(true);
    }

    if (parallaxError) {
      alert(`Parallax error: ${parallaxError}`);
    }
  }, [depositHash, parallaxError, isDepositPending]);

  useEffect(() => {
    if (!usdcApprovalPending && usdcApprovalHash) {
      // call the other contract here
      writeParallaxContract({
        address: PARALLAX_CONTRACT,
        abi: abi,
        functionName: "depositToPlay",
        args: [],
      });
    }

    if (usdcError) {
      alert(`USDC Error:  ${usdcError}`);
    }
  }, [usdcApprovalHash, usdcApprovalPending, usdcError]);

  const handleContribute = async () => {
    connect({ connector: connectors[0] });
    writeUSDCContract({
      address: USDC_CONTRACT,
      abi: usdcAbi,
      functionName: "approve",
      args: [PARALLAX_CONTRACT, parseUnits("10", 6)],
    });
  };

  const shareInvestigation = async () => {
    await sdk.actions.openUrl(
      `https://warpcast.com/~/compose?text=${encodeURIComponent(
        "I just signed up to investigate a crime. Join Parallax and see if you can solve the crime before me!"
      )}&embeds[]=https://parallax.cool`
    );
  };

  return (
    <div className="text-blue-200 m-10 font-pressStart max-w-lg mx-auto bg-indigo-900 bg-opacity-80 p-6 rounded-lg mb-8 border border-indigo-700 text-center">
      <h1 className="text-center text-xl font-pressStart mb-6">
        Hello, Detective {user.displayName || user.username}
      </h1>
      {hasDeposited ? (
        <div>
          <p className="mt-6">
            You've already contributed to the investigation fund!
          </p>
          {playersLeftToRegister > 0 ? (
            <div>
              <p className="mt-6">
                You need {playersLeftToRegister} detectives to join before the
                investigation can start.
              </p>
              <p className="mt-6">
                <button onClick={shareInvestigation} className="underline">
                  Ask others to join now!
                </button>
              </p>
            </div>
          ) : (
            <div />
          )}
        </div>
      ) : (
        <div>
          <p>
            To join the investigation, you must contribute $10 USDC to the
            investigation fund.
          </p>
          <p className="mt-6">
            The investigation will begin when {playersLeftToRegister} additional
            detective join.
          </p>
          <button
            onClick={handleContribute}
            className="my-10 uppercase text-xs px-8 py-3 bg-orange-500 hover:bg-orange-600 text-indigo-950 font-bold rounded transition-all duration-200 hover:scale-105 active:scale-95 font-pressStart"
          >
            Contribute
          </button>
        </div>
      )}
      <div className="mt-10">
        <Link to="/info"          
          className="my-10 uppercase text-xs px-8 py-3 bg-orange-500 hover:bg-orange-600 text-indigo-950 font-bold rounded transition-all duration-200 hover:scale-105 active:scale-95 font-pressStart"
        >
          How does this work?
        </Link>
      </div>
    </div>
  );
};

export default Onboarding;
