import { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router";
import { BaseCharacter, Message } from "../types";
import { BASE_URL } from "../utils/config";
import useAuthToken from "../hooks/useAuthToken";

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
        const response = await fetch(
          `/chat/${character.keyvalues.characterId}`
        );

        if (response.ok) {
          const data = await response.json();
          if (data.messages && data.messages.length > 0) {
            setMessages(data.messages);
          }
        }
      }
    } catch (error) {
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
          'fc-auth-token': token
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
      }
    } catch (error: any) {
      console.error("Error:", error);
      
      // More specific error handling
      let errorMessage = "Sorry, there was an error communicating with the character.";
      
      // Handle specific error types
      if (error.message?.includes("overloaded")) {
        errorMessage = "The AI service is currently overloaded. Please try again in a few moments.";
      } else if (error.message?.includes("rate limit")) {
        errorMessage = "You've reached the rate limit. Please try again in a few minutes.";
      } else if (error.message?.includes("Network response was not ok")) {
        errorMessage = "Unable to connect to the character service. Please check your internet connection.";
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

  return (
    <div className="w-[90%] mx-auto py-10">
      <Link to="/case-file">
        <p className="mb-4 uppercase text-xs underline font-pressStart">Back to case files</p>
      </Link>
      <div className="flex items-center">
        {/* Photo placeholder */}
        <div className="w-16 h-16 bg-gray-200 border-4 border-white mb-1 relative overflow-hidden">
          {/* Placeholder image grid pattern */}
          <div className="absolute inset-0 grid grid-cols-4 grid-rows-4">
            {[...Array(16)].map((_, i) => (
              <div
                key={i}
                className={`border border-gray-400 ${
                  i % 2 === 0 ? "bg-gray-300" : "bg-gray-200"
                }`}
              ></div>
            ))}
          </div>
          {/* Question mark overlay */}
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-2xl font-bold">
            ?
          </div>
        </div>
        <p className="font-pressStart ml-4">{character.name}</p>
      </div>
      <div className="bg-black rounded-md p-4">
        <p className="text-xs font-pressStart text-white">{crime}</p>
      </div>
      <div className="bg-white rounded-md min-h-[60vh] mt-10 p-4 flex flex-col">
        <div className="flex-grow overflow-y-auto mb-4">
          {visibleMessages.length === 0 ? (
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
  );
};

export default Character;
