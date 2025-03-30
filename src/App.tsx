import { useEffect, useState } from "react";
import logo from "./assets/parallax.png";
import { Link } from "react-router";

function App() {
  const [hasStarted, setHasStarted] = useState(false);
  return (
    <>
      {hasStarted ? (
        <div></div>
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
                The year is 2125, the world is not only more insular, countries are insular. States have become neighborhoods. Rules are determined by each neighborhood.
                </p>
                <p className="mb-4 text-xs md:text-base leading-relaxed text-blue-200">
                Trans-neighborhood travel is often banned and trans-global travel can only happen the through deals brokered across multiple territories and with the backing of the few tech companies that can provide air travel.
                </p>
                <p className="mb-4 text-xs md:text-base leading-relaxed text-blue-200">
                  Yet through it all, the neighborhood of Helix has built a
                  community of openness and trust. Its citizens know each other,
                  socialize, and are happy.
                </p>
                <p className="text-xs md:text-base leading-relaxed text-blue-200">
                  That is... until the crime.
                </p>
              </div>

              <Link
                to="/case-file"
                className="uppercase text-xs px-8 py-3 bg-orange-500 hover:bg-orange-600 text-indigo-950 font-bold rounded transition-all duration-200 hover:scale-105 active:scale-95 font-pressStart"
                onClick={() => console.log("Start Investigation")}
              >
                Investigate
              </Link>
            </div>
          </div>

          {/* Overlay scan lines effect */}
          <div className="pointer-events-none fixed inset-0 z-20 bg-gradient-to-b from-transparent to-indigo-950 opacity-30"></div>
         

          {/* Additional pixelated elements */}
          
        </div>
      )}
    </>
  );
}

export default App;
