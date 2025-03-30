import { useEffect, useState } from "react";
import { BaseCharacter, Character } from "../types";
import { pinata } from "../utils/pinata";
import { Link } from "react-router";

const CaseFile = () => {
  const [loading, setLoading] = useState(true);
  const [crime, setCrime] = useState("");
  const [characterInfo, setCharacters] = useState<BaseCharacter[]>([]);

  useEffect(() => {
    const loadCrimeAndCharacterData = async () => {
      try {
        setLoading(true);
        //  check local storage first
        const localCharacters = localStorage.getItem("parallax-characters");
        const localCrime = localStorage.getItem("parallax-crime");

        if (localCharacters && localCrime) {
          const parsedCharacters = JSON.parse(localCharacters);
          setCharacters(parsedCharacters);
          setCrime(localCrime);
        } else {
          const res = await fetch(`${import.meta.env.VITE_BASE_URL}/case-file`);
          const data = await res.json();
          const { characters, crime } = data;
          console.log(characters);
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
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };
    loadCrimeAndCharacterData();
  }, []);

  const pixelText = "font-mono uppercase tracking-wide";

  return (
    <div className="mt-20 max-w-3/4 flex flex-col items-center p-4 bg-blue-900 text-white mx-auto font-mono">
      {/* Crime Title Banner */}
      <div className="w-full bg-red-800 p-2 mb-6 border-4 border-white font-pressStart">
        <h1 className={`text-center text-md font-bold mb-1 uppercase`}>
          Crime Scene
        </h1>
        <p className={`font-pressStart text-center text-xs leading-tight`}>
          {crime}
        </p>
      </div>
      <div className="w-full mb-4 border-4 border-white p-2 bg-black">
        <div className={`font-pressStart text-sm`}>
          <p className="text-yellow-500 text-center">Select witness</p>
        </div>
      </div>
      {/* Character Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 w-full">
        {characterInfo.map((character, index) => (
          <div key={index} className="flex flex-col items-center">
            <Link to={`/${character.keyvalues.characterId}`}>
              {/* Folder with photo placeholder */}
              <div className=" flex flex-col items-center">
                {/* Photo placeholder */}
                <div className="w-16 h-16 bg-gray-200 border-4 border-white mb-1 relative overflow-hidden">
                  {/* Placeholder image grid pattern */}
                  <div className="absolute inset-0 grid grid-cols-4 grid-rows-4">
                    {[...Array(16)].map((_, i) => (
                      <div
                        key={i}
                        className={`border border-gray-400 ${
                          i % 2 === 0 ? "bg-gray-300" : "bg-gray-200"
                        }`}
                      ></div>
                    ))}
                  </div>
                  {/* Question mark overlay */}
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-2xl font-bold">
                    ?
                  </div>
                </div>

                {/* Folder tab */}
                <div className="w-full h-2 bg-yellow-600 border-t-4 border-l-4 border-r-4 border-white"></div>

                {/* Folder body */}
                <div className="w-full bg-yellow-600 border-4 border-white p-1 text-center">
                  <p
                    className={`${pixelText} text-xs text-black font-bold truncate w-full`}
                  >
                    {character.name}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
      <div className="mt-8 w-full">
        <Link to="/solve" className="block w-full">
          <div className="bg-black border-4 border-white p-3 text-center hover:bg-red-600 transition-colors">
            <p className={`font-pressStart text-sm text-white font-bold`}>
              SOLVE CRIME
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default CaseFile;
