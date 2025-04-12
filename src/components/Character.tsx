import { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router";
import { BaseCharacter, Message } from "../types";
import { BASE_URL } from "../utils/config";
import useAuthToken from "../hooks/useAuthToken";
import CrimeSceneTape from "./CrimeSceneTape";

const Character = () => {
  const [character, setCharacter] = useState<BaseCharacter>({
    id: "",
    name: "",
    cid: "",
    keyvalues: {
      characterId: "",
    },
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState("");
  const [crime, setCrime] = useState("");
  const [chatError, setErrorMessage] = useState("");
  const [loadingChatMessages, setLoadingChatMessages] = useState(false);
  const [showCrimeDetails, setShowCrimeDetails] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { characterId } = useParams();
  const { generateToken } = useAuthToken();

  useEffect(() => {
    const characters = localStorage.getItem("parallax-characters");
    const crime =
      localStorage.getItem("parallax-crime") || "A mysterious murder";
    setCrime(crime);
    if (characters) {
      const parsedCharacters = JSON.parse(characters);
      const foundCharacter = parsedCharacters.find(
        (c: BaseCharacter) => c.keyvalues.characterId === characterId
      );
      setCharacter(foundCharacter);

      // Initialize with any existing conversation or set up initial system message
      initializeConversation(foundCharacter);
    }
  }, [characterId]);

  const initializeConversation = async (character: BaseCharacter) => {
    try {
      // Only fetch if we don't already have messages
      if (messages.length === 0) {
        setLoadingChatMessages(true);
        const token = await generateToken();
        const response = await fetch(
          `${BASE_URL}/chat/${character.keyvalues.characterId}`,
          {
            headers: {
              "fc-auth-token": token,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.messages && data.messages.length > 0) {
            setMessages(data.messages);
          }
        }

        setLoadingChatMessages(false);
      }
    } catch (error) {
      setLoadingChatMessages(false);
      console.error("Error initializing conversation:", error);
    }
  };

  useEffect(() => {
    // Scroll to bottom of messages
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentResponse]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    if (!inputText.trim() || isLoading) return;

    // Add user message to chat
    const userMessage: Message = {
      role: "user",
      content: inputText,
    };

    // Update messages with the new user message
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText("");
    setIsLoading(true);

    // Reset current response
    setCurrentResponse("");
    let fullResponse = ""; // Use a local variable to track the complete response

    try {
      // Create the request
      const token = await generateToken();
      const response = await fetch(`${BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
          "fc-auth-token": token,
        },
        body: JSON.stringify({
          characterId: character.keyvalues.characterId,
          crime,
          messages: updatedMessages,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      // Process the stream
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);

            if (data === "[DONE]") {
              // Stream is complete
              break;
            }

            try {
              const parsedData = JSON.parse(data);

              // Check if the response contains an error
              if (parsedData.error) {
                throw new Error(parsedData.message || "An error occurred");
              }

              const contentChunk = parsedData.content || "";
              fullResponse += contentChunk; // Add to local variable
              setCurrentResponse(fullResponse); // Update state with complete response so far
            } catch (e) {
              console.error("Error parsing JSON:", e);
              throw e; // Re-throw to be caught by the outer try-catch
            }
          }
        }
      }

      // Add the complete AI response to messages using the local variable
      if (fullResponse) {
        const assistantMessage: Message = {
          role: "assistant",
          content: fullResponse,
        };

        // Update messages state with both user and assistant messages
        const finalMessages = [...updatedMessages, assistantMessage];
        setMessages(finalMessages);
        //  Store final messages
        const token = await generateToken();
        await fetch(
          `${BASE_URL}/storage/chat/${character.keyvalues.characterId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "fc-auth-token": token,
            },
            body: JSON.stringify({ messages: finalMessages }),
          }
        );
      }
    } catch (error: any) {
      console.error("Error:", error);

      // More specific error handling
      let errorMessage =
        "Sorry, there was an error communicating with the character.";

      // Handle specific error types
      if (error.message?.includes("overloaded")) {
        errorMessage =
          "The AI service is currently overloaded. Please try again in a few moments.";
      } else if (error.message?.includes("rate limit")) {
        errorMessage =
          "You've reached the rate limit. Please try again in a few minutes.";
      } else if (error.message?.includes("Network response was not ok")) {
        errorMessage =
          "Unable to connect to the character service. Please check your internet connection.";
      }

      setErrorMessage(errorMessage);
    } finally {
      setIsLoading(false);
      setCurrentResponse(""); // Clear streaming state
    }
  };

  // Render only user and assistant messages, not system messages
  const visibleMessages = messages.filter(
    (msg) => msg.role === "user" || msg.role === "assistant"
  );

  const pixelText = "font-mono uppercase tracking-wide";

  return (
    <div className="w-[90%] mx-auto py-10">
      <Link to="/case-file">
        <p className="px-4 mt-4 mb-4 uppercase text-xs underline font-pressStart">
          Back to case files
        </p>
      </Link>
      <div className="mt-10 bg-indigo-900 bg-opacity-80 p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <p className="font-pressStart ml-4">{character.name}</p>
          <p className={`${pixelText} text-xs`}>
            <button onClick={() => setShowCrimeDetails(!showCrimeDetails)}>
              {showCrimeDetails ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="size-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="size-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
              )}
            </button>
          </p>
        </div>
        <div className={`${showCrimeDetails ? "inline" : "hidden"}`}>
          <CrimeSceneTape />
          <h1
            className={`font-pressStart text-center text-md font-bold mb-1 uppercase`}
          >
            Crime Scene
          </h1>
          <p className={`${pixelText} text-center text-sm leading-tight`}>
            {crime}
          </p>
          <CrimeSceneTape />
        </div>

        {/* Chat container with fixed height and proper scrolling */}
        <div className="bg-white rounded-md mt-10 p-4 flex flex-col h-[70vh]">
          <div className="flex-grow overflow-y-auto mb-4 custom-scrollbar">
            {loadingChatMessages ? (
              <div className="text-center text-gray-500 mt-10">
                Checking for previous messages...
              </div>
            ) : visibleMessages.length === 0 ? (
              <div className="text-center text-gray-500 mt-10">
                Start a conversation with {character.name}
              </div>
            ) : (
              <div className="space-y-4 text-black">
                {visibleMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      message.role === "user"
                        ? "bg-blue-100 ml-auto max-w-[80%] text-right"
                        : message.role === "assistant"
                        ? "bg-gray-100 mr-auto max-w-[80%]"
                        : "bg-red-100 mx-auto max-w-[90%] text-center"
                    }`}
                  >
                    {message.content}
                  </div>
                ))}

                {/* Streaming response */}
                {isLoading && currentResponse && (
                  <div className="bg-gray-100 mr-auto max-w-[80%] p-3 rounded-lg">
                    {currentResponse}
                    <span className="inline-block animate-pulse">▌</span>
                  </div>
                )}

                {chatError && (
                  <div className="text-red text-center w-full">
                    <span>{chatError}</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
              placeholder={`Ask something...`}
              className="text-black flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="bg-purple-500 text-white px-4 py-2 rounded-md disabled:bg-purple-300"
            >
              {isLoading ? "..." : ">"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Character;
