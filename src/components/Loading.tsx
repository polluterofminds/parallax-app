import { useState, useEffect } from "react";

const Loading = () => {
  const timeMessages = [
    "Finding time destination",
    "Searching for crimes",
    "Calibrating jump coordinates",
    "Aligning timeline manifests"
  ];
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayMessage, setDisplayMessage] = useState(timeMessages[0]);
  const [isFlipping, setIsFlipping] = useState(false);

  // Start flipping when component mounts
  useEffect(() => {
    setIsFlipping(true);
  }, []);

  // Move to next message as soon as current one completes
  useEffect(() => {
    if (isFlipping) return; // Don't start new transition while one is in progress
    // Small delay before starting next transition
    const nextTimer = setTimeout(() => {
      const nextIndex = (currentMessageIndex + 1) % timeMessages.length;
      setCurrentMessageIndex(nextIndex);
      setIsFlipping(true);
    }, 500); // Just a short pause between messages
    return () => clearTimeout(nextTimer);
  }, [isFlipping, currentMessageIndex]);

  // Handle the flipping animation
  useEffect(() => {
    if (!isFlipping) return;
    const nextMessage = timeMessages[currentMessageIndex];
    let tempMessage = displayMessage;
    let charIndex = 0;
    const flipInterval = setInterval(() => {
      if (charIndex >= nextMessage.length) {
        clearInterval(flipInterval);
        setIsFlipping(false);
        return;
      }
      // Update one character at a time
      const chars = tempMessage.split('');
      if (charIndex < chars.length) {
        chars[charIndex] = nextMessage[charIndex];
      } else {
        chars.push(nextMessage[charIndex]);
      }
      tempMessage = chars.join('');
      // Trim message if next message is shorter
      if (tempMessage.length > nextMessage.length) {
        tempMessage = tempMessage.substring(0, nextMessage.length);
      }
      setDisplayMessage(tempMessage);
      charIndex++;
    }, 50);
    return () => clearInterval(flipInterval);
  }, [isFlipping, currentMessageIndex]);

  // Define the keyframes animation style
  const flipCharAnimation = `
    @keyframes flipChar {
      0% { transform: rotateX(0); }
      50% { transform: rotateX(90deg); }
      100% { transform: rotateX(0); }
    }
  `;

  return (
    <div className="w-4/5 m-auto min-h-screen flex flex-col justify-center items-center">
      <style dangerouslySetInnerHTML={{ __html: flipCharAnimation }} />
      <div className="text-center">
        <p className="font-pressStart">
          {displayMessage.split('').map((char, index) => (
            <span
              key={index}
              className="inline-block relative overflow-hidden"
              style={{
                width: char === ' ' ? '0.5em' : '1em',
                height: '1.5em',
                perspective: '1000px',
                marginRight: '1px'
              }}
            >
              <span
                className="inline-block w-full h-full"
                style={{
                  animation: index === displayMessage.length - 1 && isFlipping ? 'flipChar 0.2s' : 'none',
                }}
              >
                {char}
              </span>
            </span>
          ))}
        </p>
      </div>
    </div>
  );
};

export default Loading;