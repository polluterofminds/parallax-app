import { useEffect, useState } from "react";
import { FCProfile } from "../types";
import {
  useConnect,
  useWriteContract,
} from "wagmi";
import { abi, usdcAbi } from "../utils/abi";
import { parseUnits } from "viem";
import {
  PARALLAX_CONTRACT,
  USDC_CONTRACT,
} from "../utils/config";
import { Link, useNavigate } from "react-router";
import EpisodeTimer from "./EpisodeTimer";

type OnboardingProps = {
  episodeTimeLeft: string;
  hasDeposited: boolean;
  setHasDeposited: (deposited: boolean) => void;
};

const Onboarding = ({
  hasDeposited,
  setHasDeposited
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
  
  const { connect, connectors } = useConnect();
  const navigate = useNavigate();

  useEffect(() => {
    const userProfile = localStorage.getItem("fc-profile-data");
    if (userProfile) {
      setUser(JSON.parse(userProfile));
    }
  }, []);


  useEffect(() => {
    if (hasDeposited) {
      navigate("/case-file");
    }
  }, [hasDeposited, navigate]);

  useEffect(() => {
    if (!isDepositPending && depositHash) {
      // Now we need to check the contract again and update state
      setHasDeposited(true);
    }

    if (parallaxError) {
      alert(`Parallax error: ${parallaxError}`);
    }
  }, [depositHash, parallaxError, isDepositPending, setHasDeposited]);

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
  }, [usdcApprovalHash, usdcApprovalPending, usdcError, writeParallaxContract]);

  const handleContribute = async () => {
    connect({ connector: connectors[0] });
    writeUSDCContract({
      address: USDC_CONTRACT,
      abi: usdcAbi,
      functionName: "approve",
      args: [PARALLAX_CONTRACT, parseUnits("10", 6)],
    });
  };

  return (
    <div>
      <div className="mt-4 text-center m-auto">
        <EpisodeTimer />
      </div>
      <div className="text-blue-200 m-10 font-pressStart max-w-lg mx-auto bg-indigo-900 bg-opacity-80 p-6 rounded-lg mb-8 border border-indigo-700 text-center">
        <h1 className="text-center text-xl font-pressStart mb-6">
          Hello, Detective {user.displayName || user.username}
        </h1>
        <div>
          <p>
            To join the investigation, you must contribute $5 USDC to the
            investigation fund.
          </p>
          <button
            onClick={handleContribute}
            className="my-10 uppercase text-xs px-8 py-3 bg-orange-500 hover:bg-orange-600 text-indigo-950 font-bold rounded transition-all duration-200 hover:scale-105 active:scale-95 font-pressStart"
          >
            Contribute
          </button>
        </div>
        <div className="mt-10 text-yellow-400">
          <div className="font-pressStart mt-8 mb-20 underline">
            <Link to="/info">How does this work?</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
