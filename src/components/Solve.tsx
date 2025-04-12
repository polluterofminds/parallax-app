import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { BASE_URL, PARALLAX_CONTRACT } from "../utils/config";
import useAuthToken from "../hooks/useAuthToken";
import EpisodeTimer from "./EpisodeTimer";
import CrimeSceneTape from "./CrimeSceneTape";
import useEpisodeTimer from "../hooks/useEpisodeTimer";
import { useAccount, useWriteContract } from "wagmi";
import { abi } from "../utils/abi";

const Solve = () => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [crime, setCrime] = useState("");
  const [response, setResponse] = useState("");
  const [solution, setSolution] = useState({
    victims: "",
    criminal: "",
    motive: "",
  });
  const [solutionAttempts, setSolutionAttempts] = useState(0);
  const [hasPaid, setHasPaid] = useState(false);

  const navigate = useNavigate();
  const { generateToken } = useAuthToken();
  const { timeLeft } = useEpisodeTimer();
  const { data: hash, writeContract } = useWriteContract();
  const { address } = useAccount();

  useEffect(() => {
    // Load the crime description from localStorage
    const localCrime = localStorage.getItem("parallax-crime");
    if (localCrime) {
      setCrime(localCrime);
    } else {
      // If no crime is found in localStorage, redirect to case file
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    getSolutions();
  }, []);

  useEffect(() => {
    if (hash) {
      const updateSolutionAttempts = async () => {
        const token = await generateToken();
        await fetch(`${BASE_URL}/solution_attempts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "fc-auth-token": token,
          },
          body: JSON.stringify({}),
        });

        getSolutions();
      };

      updateSolutionAttempts();
    }
  }, [hash]);

  const getSolutions = async () => {
    const token = await generateToken();
    const res = await fetch(`${BASE_URL}/solution_attempts`, {
      headers: {
        "fc-auth-token": token,
      },
    });

    const data = await res.json();
    const solutions = data.data.solutionAttempts;
    const hasPaid = data.data.payment;
    setHasPaid(hasPaid);
    setSolutionAttempts(solutions);
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setSolution((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if(!address) {
      alert("No connected address");
      return;
    }
    setSubmitting(true);
    setError("");
    setResponse("");

    try {
      // Submit the solution to the API
      const token = await generateToken();
      const res = await fetch(`${BASE_URL}/solve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "fc-auth-token": token,
        },
        body: JSON.stringify({ userSolution: solution, address }),
      });

      const data = await res.json();

      if (data.data.status === "right") {
        setSuccess(true);
        setResponse(
          data.data.message || "Congratulations! You've solved the crime!"
        );
      } else {
        setSuccess(false);
        setResponse(
          `Not quite!\nVictims: ${data.data.victims}\nCriminal:${data.data.criminal}\nMotive:${data.data.motive}`
        );
      }

      getSolutions();
    } catch (err) {
      console.error(err);
      setError(
        "An error occurred while submitting your solution. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const payExtra = async (e: any) => {
    e.preventDefault();
    //  This will be a smart contract call, but for now, it's an API call
    writeContract({
      address: PARALLAX_CONTRACT,
      abi,
      functionName: "payForExtraSolutionAttempt",
      args: [],
    });
  };

  // Pixel text style class
  const pixelText = "font-mono uppercase tracking-wide";
  console.log(solutionAttempts === 0 || (hasPaid && solutionAttempts < 2));
  return (
    <div className="w-[90%] mx-auto py-10">
      <Link to="/case-file">
        <p className="mb-4 uppercase text-xs underline font-pressStart">
          Back to case files
        </p>
      </Link>
      <div className="text-center mt-4">
        <EpisodeTimer />
      </div>
      <div className="mt-10 text-white m-10 font-pressStart max-w-lg mx-auto bg-indigo-900 bg-opacity-80 p-6 rounded-lg mb-8 border border-indigo-700">
        {/* Crime Title Banner */}
        <div className="w-full p-2 mb-6">
          <CrimeSceneTape />
          <h1
            className={`font-pressStart text-center text-md font-bold mb-1 uppercase`}
          >
            {timeLeft?.isOver ? "Case ended" : "Solve The Crime"}
          </h1>
          <p className={`${pixelText} text-center text-xs leading-tight`}>
            {crime}
          </p>
          <CrimeSceneTape />
        </div>

        {success ? (
          <div className="w-full">
            {/* Success Message */}
            <div className="w-full">
              <h2 className={`${pixelText} text-center text-lg font-bold mb-2`}>
                CASE CLOSED
              </h2>
              <p className="text-center mb-4">{response}</p>

              <div className="w-full bg-yellow-500 p-3 mb-4 border-2 border-white">
                <p className="text-center text-black font-bold">
                  The next crime starts when at least 10 players join!
                </p>
              </div>

              <Link to="/" className="block w-full mt-6">
                <div className="bg-blue-700 hover:bg-blue-600 p-2 text-center border-4 border-white transition-colors">
                  <Link to="/">
                    <span
                      className={`font-pressStart font-bold uppercase underline`}
                    >
                      Join the next investigation
                    </span>
                  </Link>
                </div>
              </Link>
            </div>
          </div>
        ) : (
          <div className="w-full">
            {response && (
              <div
                className={`w-full p-3 mb-4 border-2 ${
                  success
                    ? "bg-green-700 border-green-500"
                    : "bg-red-700 border-red-500"
                }`}
              >
                <p className="text-center">{response}</p>
              </div>
            )}

            {error && (
              <div className="w-full bg-red-700 p-2 mb-4 border-2 border-red-500">
                <p className="text-center text-white">{error}</p>
              </div>
            )}
            {timeLeft && !timeLeft.isOver && (
              <form onSubmit={handleSubmit} className="w-full">
                {solutionAttempts === 0 || (hasPaid && solutionAttempts < 2) ? (
                  <div className="p-4 mb-6">
                    <div className="mb-4">
                      <label
                        className={`${pixelText} block mb-1 text-yellow-400`}
                      >
                        WHO WAS THE VICTIM?
                      </label>
                      <input
                        type="text"
                        name="victims"
                        value={solution.victims}
                        onChange={handleChange}
                        required
                        className="w-full bg-white text-black border-2 border-gray-600 p-2 focus:border-yellow-400 outline-none"
                      />
                    </div>

                    <div className="mb-4">
                      <label
                        className={`${pixelText} block mb-1 text-yellow-400`}
                      >
                        WHO WAS THE CRIMINAL?
                      </label>
                      <input
                        type="text"
                        name="criminal"
                        value={solution.criminal}
                        onChange={handleChange}
                        required
                        className="w-full bg-white text-black border-2 border-gray-600 p-2 focus:border-yellow-400 outline-none"
                      />
                    </div>

                    <div className="mb-4">
                      <label
                        className={`${pixelText} block mb-1 text-yellow-400`}
                      >
                        WHAT WAS THE MOTIVE?
                      </label>
                      <textarea
                        name="motive"
                        value={solution.motive}
                        onChange={handleChange}
                        required
                        rows={3}
                        className="w-full bg-white text-black border-2 border-gray-600 p-2 focus:border-yellow-400 outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full uppercase px-8 py-3 bg-orange-500 hover:bg-orange-600 text-indigo-950 font-bold rounded transition-all duration-200 hover:scale-105 active:scale-95 font-pressStart"
                    >
                      <span className={`text-xs font-bold font-pressStart`}>
                        {submitting ? "SUBMITTING..." : "SUBMIT SOLUTION"}
                      </span>
                    </button>
                  </div>
                ) : solutionAttempts === 1 && !hasPaid ? (
                  <div>
                    <p className="font-pressStart">
                      You've already tried to solve this case. You can try one
                      more time for $2 USDC.
                    </p>
                    <button
                      type="button"
                      onClick={payExtra}
                      className="mt-4 w-full uppercase px-8 py-3 bg-orange-500 hover:bg-orange-600 text-indigo-950 font-bold rounded transition-all duration-200 hover:scale-105 active:scale-95 font-pressStart"
                    >
                      Pay $2 USDC
                    </button>
                  </div>
                ) : (
                  <p className="font-pressStart">
                    You've used all your attempts to solve this case.
                  </p>
                )}
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Solve;
