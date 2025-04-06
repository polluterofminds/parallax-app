import { useEffect, useState } from "react";
import logo from "../assets/parallax.png";
import { useNavigate } from "react-router";
import {
  useAccount,
  useConnect,
  useReadContracts,
} from "wagmi";
import { BASE_URL, wagmiContractConfig } from "../utils/config";
import Onboarding from "./Onboarding";
import Loading from "./Loading";
import { BaseError } from "viem";
import useAuthToken from "../hooks/useAuthToken";
import { sdk } from "@farcaster/frame-sdk";

function Welcome() {
  const [hasStarted, setHasStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [startingInvestigation, setStartingInvestigation] = useState(false);
  const [hasDeposited, setHasDeposited] = useState(false);
  const [playersLeftToRegister, setPlayersLeftToRegister] = useState(10);
  const { address } = useAccount();
  const { connect, connectors } = useConnect();
  const navigate = useNavigate();
  const { generateToken } = useAuthToken();
  const { data, error } = useReadContracts({
    contracts: [
      {
        ...wagmiContractConfig,
        functionName: "getCurrentCasePlayers",
        args: [],
      },
      {
        ...wagmiContractConfig,
        functionName: "getRemainingPlayersNeeded",
        args: [],
      },
    ],
    query: {
      enabled: !!address,
    },
  });
  const [players, remainingPlayersNeeded]: any = data || [];

  useEffect(() => {
    if (error)
      alert(
        `Error: ${(error as BaseError).shortMessage || error.message}`
      );
    if (players && remainingPlayersNeeded && address) {
      const playersNeeded = remainingPlayersNeeded.result;
      const playersRegistered = players.result;     

      const foundAddress = playersRegistered.find((a: string) => a === address);
      if (foundAddress) {
        setHasDeposited(true);
      } 

      setPlayersLeftToRegister(playersNeeded);

      // if(playersNeeded < 1 && foundAddress) {
      //   navigate("/case-file");
      // }
    }

    setLoading(false);
  }, [players, remainingPlayersNeeded, address, error, navigate]);

  useEffect(() => {
    //  Check game status on chain
    connect({ connector: connectors[0] });
  }, []);

  const handleConnect = async () => {
    try {
      setStartingInvestigation(true);
      
      const token = await generateToken();

      const res = await fetch(`${BASE_URL}/users/me`, {
        method: "GET",
        headers: {
          "fc-auth-token": token,
        },
      });

      const userData = await res.json();

      localStorage.setItem("fc-profile-data", JSON.stringify(userData.profile));
      if(userData.profile.frameAdded === false) {
        try {
          await sdk.actions.addFrame();          
        } catch (error) {
          alert(error);
        }        
      }
      setHasStarted(true);
      setStartingInvestigation(false);
    } catch (error: any) {
      setStartingInvestigation(false);
      alert(error);
    }
  };

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <>
          {hasStarted ? (
            <Onboarding playersLeftToRegister={playersLeftToRegister} setPlayersLeftToRegister={setPlayersLeftToRegister} hasDeposited={hasDeposited} setHasDeposited={setHasDeposited} />
          ) : (
            <div>
              {/* Main content */}
              <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
                <div className="text-center">
                  <h1 className="text-center ml-4">
                    <img src={logo} alt="Parallax" />
                  </h1>

                  <div className="bg-indigo-800 inline-block px-8 py-1 mb-16 rounded">
                    <h2 className="font-pressStart text-2xl md:text-3xl pixelated text-orange-400">
                      HELIX
                    </h2>
                  </div>

                  <div className="font-pressStart max-w-lg mx-auto bg-indigo-900 bg-opacity-80 p-6 rounded-lg mb-8 border border-indigo-700">
                    <p className="mb-4 text-xs md:text-base leading-relaxed text-blue-200">
                      The year is 2125, the world is not only more insular,
                      countries are insular. States have become neighborhoods.
                      Rules are determined by each neighborhood.
                    </p>
                    <p className="mb-4 text-xs md:text-base leading-relaxed text-blue-200">
                      Trans-neighborhood travel is often banned and trans-global
                      travel can only happen through deals brokered across
                      multiple territories and with the backing of the few tech
                      companies that can provide air travel.
                    </p>
                    <p className="mb-4 text-xs md:text-base leading-relaxed text-blue-200">
                      Yet through it all, the neighborhood of Helix has built a
                      community of openness and trust. Its citizens know each
                      other, socialize, and are happy.
                    </p>
                    <p className="text-xs md:text-base leading-relaxed text-blue-200">
                      That is... until the crime.
                    </p>
                  </div>
                  <button
                    disabled={startingInvestigation}
                    onClick={handleConnect}
                    className="mb-20 uppercase text-xs px-8 py-3 bg-orange-500 hover:bg-orange-600 text-indigo-950 font-bold rounded transition-all duration-200 hover:scale-105 active:scale-95 font-pressStart"
                  >
                    {startingInvestigation ? "Starting investigation..." : "Investigate"}
                  </button>
                </div>
              </div>

              {/* Overlay scan lines effect */}
              <div className="mb-20 pointer-events-none fixed inset-0 z-20 bg-gradient-to-b from-transparent to-indigo-950 opacity-30"></div>

              {/* Additional pixelated elements */}
            </div>
          )}
        </>
      )}
    </>
  );
}

export default Welcome;
