import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter, Routes, Route } from "react-router";
import CaseFile from "./components/CaseFile.tsx";
import Character from "./components/Character.tsx";
import Solve from "./components/Solve.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div className="bg-[url(./assets/background.png)] relative min-h-screen bg-indigo-950 font-mono text-yellow-400 overflow-hidden">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/case-file" element={<CaseFile />} />
          <Route path="/:characterId" element={<Character />} />
          <Route path="/solve" element={<Solve />} />
        </Routes>
      </BrowserRouter>
    </div>
  </StrictMode>
);
