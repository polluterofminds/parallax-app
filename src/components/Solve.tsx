import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { BASE_URL } from "../utils/config";
import useAuthToken from "../hooks/useAuthToken";

const Solve = () => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [crime, setCrime] = useState("");
  const [response, setResponse] = useState("");
  const [mintingNFT, setMintingNFT] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [mintError, setMintError] = useState("");
  const [solution, setSolution] = useState({
    victims: "",
    criminal: "",
    motive: "",
  });

  const navigate = useNavigate();
  const { generateToken } = useAuthToken();

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

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setSolution((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
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
        body: JSON.stringify({ userSolution: solution }),
      });

      const data = await res.json();
      console.log(data.data);

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
    } catch (err) {
      console.error(err);
      setError(
        "An error occurred while submitting your solution. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleMintNFT = async () => {
    setMintingNFT(true);
    setMintError("");

    try {
      setMintSuccess(true);
      //   // Create metadata for the NFT
      //   const metadata = {
      //     name: "Parallax Detective Agency - Case Solved",
      //     description: `Successfully solved the case: ${crime}`,
      //     attributes: [
      //       {
      //         trait_type: "Case",
      //         value: crime.substring(0, 30) // Truncate if too long
      //       },
      //       {
      //         trait_type: "Criminal",
      //         value: solution.criminal
      //       },
      //       {
      //         trait_type: "Date Solved",
      //         value: new Date().toISOString().split('T')[0]
      //       }
      //     ]
      //   };
      //   // Use pinata to pin the metadata to IPFS
      //   const pinResult = await pinata.pinJSONToIPFS(metadata);
      //   if (pinResult.IpfsHash) {
      //     // Call your API to mint the NFT with the IPFS hash
      //     const mintRes = await fetch(`${import.meta.env.VITE_BASE_URL}/mint`, {
      //       method: "POST",
      //       headers: {
      //         "Content-Type": "application/json"
      //       },
      //       body: JSON.stringify({
      //         metadataUri: `ipfs://${pinResult.IpfsHash}`
      //       })
      //     });
      //     const mintData = await mintRes.json();
      //     if (mintData.success) {
      //       setMintSuccess(true);
      //     } else {
      //       setMintError(mintData.message || "Failed to mint NFT");
      //     }
      //   } else {
      //     setMintError("Failed to upload metadata to IPFS");
      //   }
      navigate("/");
    } catch (err) {
      console.error(err);
      setMintError(
        "An error occurred while minting your NFT. Please try again."
      );
    } finally {
      setMintingNFT(false);
    }
  };

  // Pixel text style class
  const pixelText = "font-mono uppercase tracking-wide";

  return (
    <div className="w-[90%] mx-auto py-10">
      <Link to="/case-file">
        <p className="mb-4 uppercase text-xs underline font-pressStart">
          Back to case files
        </p>
      </Link>
      <div className="mt-20 text-white m-10 font-pressStart max-w-lg mx-auto bg-indigo-900 bg-opacity-80 p-6 rounded-lg mb-8 border border-indigo-700">
        {/* Crime Title Banner */}
        <div className="w-full bg-red-800 p-2 mb-6 border-4 border-white font-pressStart">
          <h1 className={`text-center text-md font-bold mb-1 uppercase`}>
            Solve The Crime
          </h1>
          <p className={`font-pressStart text-center text-xs leading-tight`}>
            {crime}
          </p>
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

              {!mintSuccess ? (
                <button
                  onClick={handleMintNFT}
                  disabled={mintingNFT}
                  className="w-full uppercase px-8 py-3 bg-orange-500 hover:bg-orange-600 text-indigo-950 font-bold rounded transition-all duration-200 hover:scale-105 active:scale-95 font-pressStart"
                >
                  <span className={`font-pressStart font-bold`}>
                    {mintingNFT ? "MINTING..." : "MINT VICTORY NFT"}
                  </span>
                </button>
              ) : (
                <div className="w-full bg-purple-900 p-3 border-4 border-white text-center">
                  <p className={`font-PressStart font-bold mb-2`}>
                    NFT MINTED SUCCESSFULLY!
                  </p>
                  <p className="text-sm font-pressStart">
                    Check your wallet to view your trophy.
                  </p>
                </div>
              )}

              {mintError && (
                <p className="text-red-300 text-center mt-2">{mintError}</p>
              )}

              <Link to="/" className="block w-full mt-6">
                <div className="bg-blue-700 hover:bg-blue-600 p-2 text-center border-4 border-white transition-colors">
                  <Link to="/">
                    <span
                      className={`${pixelText} font-bold uppercase underline`}
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
            {/* Form for submitting solution */}
            <form onSubmit={handleSubmit} className="w-full">
              <div className="bg-black p-4 border-4 border-white mb-6">
                <div className="mb-4">
                  <label className={`${pixelText} block mb-1 text-yellow-400`}>
                    WHO WAS THE VICTIM?
                  </label>
                  <input
                    type="text"
                    name="victims"
                    value={solution.victims}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-800 border-2 border-gray-600 p-2 text-white focus:border-yellow-400 outline-none"
                  />
                </div>

                <div className="mb-4">
                  <label className={`${pixelText} block mb-1 text-yellow-400`}>
                    WHO WAS THE CRIMINAL?
                  </label>
                  <input
                    type="text"
                    name="criminal"
                    value={solution.criminal}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-800 border-2 border-gray-600 p-2 text-white focus:border-yellow-400 outline-none"
                  />
                </div>

                <div className="mb-4">
                  <label className={`${pixelText} block mb-1 text-yellow-400`}>
                    WHAT WAS THE MOTIVE?
                  </label>
                  <textarea
                    name="motive"
                    value={solution.motive}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full bg-gray-800 border-2 border-gray-600 p-2 text-white focus:border-yellow-400 outline-none resize-none"
                  />
                </div>

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
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Solve;
