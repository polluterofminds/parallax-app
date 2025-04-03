import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { http, createConfig } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { farcasterFrame as miniAppConnector } from '@farcaster/frame-wagmi-connector'

export const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
  connectors: [
    miniAppConnector()
  ]
});

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div className="bg-[url(./assets/background.png)] relative min-h-screen bg-indigo-950 font-mono text-yellow-400 overflow-hidden">
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          <App />
        </WagmiProvider>
      </QueryClientProvider>
    </div>
  </StrictMode>
);
