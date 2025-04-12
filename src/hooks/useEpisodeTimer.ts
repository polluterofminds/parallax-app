import { useEffect, useState, useRef } from "react";
import { Episode, TimeLeft } from "../types";
import useAuthToken from "./useAuthToken";
import { BASE_URL } from "../utils/config";

export default function useEpisodeTimer(): {
  timeLeft: TimeLeft | null;
  episode: Episode | null;
} {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [episode, setEpisode] = useState<Episode | null>(null);
  const { generateToken } = useAuthToken();
  
  // Use a ref to maintain worker instance
  const workerRef = useRef<Worker | null>(null);
  
  // Fetch episode data only once when component mounts
  useEffect(() => {
    let isMounted = true;
    
    const getEpisodeInfo = async (): Promise<void> => {
      try {
        const token = await generateToken();
        const res = await fetch(`${BASE_URL}/episode`, {
          headers: {
            "fc-auth-token": token,
          },
        });
        const episodeData = await res.json();
        
        // Only update state if component is still mounted
        if (isMounted) {
          setEpisode(episodeData.data);
        }
      } catch (error) {
        console.error("Failed to fetch episode:", error);
      }
    };
    
    getEpisodeInfo();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, []);
  
  // Set up web worker when episode data is loaded
  useEffect(() => {
    if (!episode) return;
    
    // Create and initialize the worker
    const initWorker = () => {
      // With Vite, you can import the worker directly
      const worker = new Worker(
        new URL('../workers/timerWorker.ts', import.meta.url),
        { type: 'module' }
      );
      
      // Listen for messages from the worker
      worker.onmessage = (e: MessageEvent) => {
        setTimeLeft(e.data);
      };
      
      // Store the worker reference
      workerRef.current = worker;
      
      // Calculate end time
      const startTime = new Date(episode.created_at);
      const endTime = new Date(startTime);
      endTime.setUTCDate(endTime.getUTCDate() + episode.duration);
      
      // Start the timer
      worker.postMessage({
        command: 'start',
        endTime: endTime.getTime()
      });
    };
    
    initWorker();
    
    // Clean up when component unmounts or episode changes
    return () => {
      if (workerRef.current) {
        // Stop the timer
        workerRef.current.postMessage({ command: 'stop' });
        // Terminate the worker
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, [episode]);
  
  return { timeLeft, episode };
}