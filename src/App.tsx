import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import CaseFile from "./components/CaseFile.tsx";
import Character from "./components/Character.tsx";
import Solve from "./components/Solve.tsx";
import Welcome from "./components/Welcome.tsx";
import { sdk } from '@farcaster/frame-sdk'
import WhatIsThis from "./components/WhatIsThis.tsx";

const App = () => {
    useEffect(() => {
        const loadFarcaster = async () => {
            await sdk.actions.ready();
        }
        loadFarcaster()
    }, []);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/case-file" element={<CaseFile />} />
        <Route path="/:characterId" element={<Character />} />
        <Route path="/solve" element={<Solve />} />
        <Route path="/info" element={<WhatIsThis />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
