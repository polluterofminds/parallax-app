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
        <div className="text-sm">
          <p className="mb-4">
            Parallax is an interactive detective game. As a time-slipping
            detective, you are assigned a case that you need to solve. But
            there's a catch...
          </p>
          <p className="mb-4">
            You'll be racing against other detectives to solve the case first.
          </p>
          <h3 className="mb-4">How it works</h3>
          <ol className="mb-4 list-disc pl-4">
            <li className="disc">
              Every detective joins by depositing $10 USDC into the Parallax
              smart contract.
            </li>
            <li>When there are at least 10 detectives, the case is opened.</li>
            <li>
              Every detective has access to the public information about the
              crime as well as a list of witnesses.
            </li>
            <li>
              All witnesses are AI generated, but they have knowledge of the
              victim(s) and others who may have been involved.
            </li>
            <li>
              Your conversations with the witnesses are not protected, and they
              may choose to share information with others that originated from
              your own conversations.
            </li>
            <li>
              Witnesses will periodically converse with themselves, generating
              broader knowledge.
            </li>
            <li>
              To solve the crime, you will click the Solve button and provide:
              <ul>
                <li>The victim(s)</li>
                <li>The criminal</li>
                <li>The motive</li>
              </ul>
            </li>
            <li>
              To officially solve the case, you must score highly on all three
              categories with motive weighted more heavily than victim or
              criminal.
            </li>
            <li>
              The first to solve the case receives the pot minus 10% which goes
              to the game.
            </li>
            <li>A new case is automatically generated.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default WhatIsThis;
