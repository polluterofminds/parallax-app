// src/workers/timerWorker.ts
let timerId: number | null = null;

self.onmessage = function(e) {
  const { command, endTime } = e.data;
  
  if (command === 'start') {
    // Clear any existing timer
    if (timerId !== null) {
      clearInterval(timerId);
    }
    
    // Set up the timer to send updates every second
    timerId = setInterval(() => {
      const now = new Date().getTime();
      const difference = endTime - now;
      
      if (difference <= 0) {
        // Episode is over, clear the timer
        clearInterval(timerId);
        timerId = null;
        
        self.postMessage({
          days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true
        });
      } else {
        // Calculate and send the remaining time
        self.postMessage({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / (1000 * 60)) % 60),
          seconds: Math.floor((difference / 1000) % 60),
          isOver: false
        });
      }
    }, 1000);
  } else if (command === 'stop') {
    // Stop the timer
    if (timerId !== null) {
      clearInterval(timerId);
      timerId = null;
    }
  }
};