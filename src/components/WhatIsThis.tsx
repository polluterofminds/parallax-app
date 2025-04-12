import { Link } from "react-router";

const WhatIsThis = () => {
  return (
    <div>
      <div className="p-4 font-pressStart underline text-sm">
        <Link to="/">
          <p className="mb-4 uppercase text-xs underline font-pressStart">
            Back
          </p>
        </Link>
      </div>
      <div className="text-blue-200 font-pressStart px-4 pt-4 pb-10 m-4 bg-indigo-900 bg-opacity-80 p-6 rounded-lg">
        <h1 className="text-lg mb-4">What is Parallax?</h1>
        <div className="space-y-4 text-sm font-mono tracking-wide line">
          <p>
            An interactive detective game where you solve cases through time.
          </p>
          <h3 className="text-md font-pressStart">Game structure</h3>
          <ul className="list-disc list-disc pl-4">
            <li>Each season has multiple episodes</li>
            <li>Each episode is 7 days long</li>
            <li>
              Episodes focuses on a single crime where you must determine within 7 days:
              <ol className="pl-8 list-decimal">
                <li>The vicitim</li>
                <li>The suspect</li>
                <li>The motive</li>
              </ol>
            </li>
            <li>Winners split the pot at the end</li>
          </ul>
          <h3 className="text-md font-pressStart">How it works</h3>
          <ol className="list-disc pl-4">
            <li>Join with $5 USDC deposit</li>
            <li>Start anytime during each episode</li>
            <li>Access public case info and AI witnesses</li>
            <li>Submit before episode deadlines</li>
            <li>Only one solution per player per episode</li>
            <ol className="list-decimal pl-8">
                <li>Players can buy ONE additional solution attempt</li>
                <li>Solution attempt payments go into the pot</li>
            </ol>
            <li>Winners split 90% of the pot (10% to the game)</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default WhatIsThis;
