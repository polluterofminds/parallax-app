import { useEffect, useState } from "react";
import { BaseCharacter } from "../types";
import { Link } from "react-router";
import { BASE_URL } from "../utils/config";
import useAuthToken from "../hooks/useAuthToken";
import Loading from "./Loading";
import folder from "../assets/folder.png"
import CrimeSceneTape from "./CrimeSceneTape";
import EpisodeTimer from "./EpisodeTimer";

const CaseFile = () => {
  const [loading, setLoading] = useState(true);
  const [crime, setCrime] = useState("");
  const [characterInfo, setCharacters] = useState<BaseCharacter[]>([]);
  const { generateToken } = useAuthToken();

  useEffect(() => {
    const loadCrimeAndCharacterData = async () => {
      try {
        setLoading(true);
        // check local storage first
        const localCharacters = null//localStorage.getItem("parallax-characters");
        const localCrime = null//localStorage.getItem("parallax-crime");
        
        if (localCharacters && localCrime) {
          const parsedCharacters = JSON.parse(localCharacters);
          setCharacters(parsedCharacters);
          setCrime(localCrime);
        } else {
          const token = await generateToken();
          const res = await fetch(`${BASE_URL}/case-file`, {
            headers: {
              "fc-auth-token": token,
            },
          });
          const data = await res.json();
          const { characters, crime } = data;
          setCrime(crime);
          if (characters && characters.length > 0) {
            localStorage.setItem(
              "parallax-characters",
              JSON.stringify(characters)
            );
            localStorage.setItem("parallax-crime", crime);
          }
          setCharacters(characters);
        }
        setLoading(false);
      } catch (error: any) {
        alert(error.message)
        console.log(error);
        setLoading(false);
      }
    };
    loadCrimeAndCharacterData();
  }, []);

  const pixelText = "font-mono uppercase tracking-wide";
  
  return (
    <div>
      <div className="mt-4 text-center m-auto">
        <EpisodeTimer />
      </div>
      {loading ? (
        <Loading />
      ) : (
        <div className="mt-10 text-white m-10 font-pressStart w-[90%] mx-auto bg-indigo-900 bg-opacity-80 p-6 rounded-lg mb-8 border border-indigo-700">          
          <div className="w-full mb-6 font-pressStart">
            <CrimeSceneTape />
            <h1 className={`text-center text-md font-bold mb-1 uppercase`}>
              Crime Scene
            </h1>
            <p className={`${pixelText} text-center text-sm leading-tight`}>
              {crime}
            </p>
            <CrimeSceneTape />
          </div>
          <div className="w-full mb-4">
            <div className={`font-pressStart text-sm`}>
              <p className="text-yellow-500 text-center">Select witness</p>
            </div>
          </div>
          {/* Character Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-0 w-full w-full">
            {characterInfo.map((character, index) => (
              <div key={index} className="flex flex-col items-center w-full">
                <Link to={`/${character.keyvalues.characterId}`}>
                  <div className="relative">
                    <img src={folder} alt="Folder" className="w-full h-auto" />
                    <div 
                      className="absolute inset-0 flex items-center justify-center px-6"
                      style={{ top: '40%', height: '30%' }}
                    >
                      <p className={`${pixelText} text-xs text-black font-bold text-center break-words max-w-full overflow-hidden`}>
                        {character.name.split(' ').map((part, i, arr) => (
                          i === arr.length - 1 && arr.length > 1 ? 
                            <span key={i} className="block">{part}</span> : 
                            <span key={i}>{part}{i < arr.length - 1 ? ' ' : ''}</span>
                        ))}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
          <div className="mt-8 w-full">
            <Link to="/solve" className="block w-full">
              <div className="text-center uppercase text-xs px-8 py-3 text-black bg-yellow-600 font-bold rounded transition-all duration-200 hover:scale-105 active:scale-95 font-pressStart">
                <p>SOLVE CRIME</p>
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseFile;