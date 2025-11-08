import React, {
  useState,
  useContext,
  useEffect,
  useRef,
  useCallback,
} from "react";
import axios from "axios";
import { ChatbotContext } from "../context/ChatbotContext";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

const SPECIALTIES = [
  "Clinical Psychologist",
  "Psychiatrist",
  "Relationship and Marriage Counsellor",
  "Child and Adolescent Counsellor",
  "Trauma and Abuse Counsellor",
  "Anxiety and Depression Specialist",
  "Career Counsellor",
];

const ChatWindow = () => {
  const { messages, addMessage } = useContext(ChatbotContext);
  const { backendUrl } = useContext(AppContext);
  const [input, setInput] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const chatRef = useRef(null);
  const navigate = useNavigate();

  // Auto-scroll to bottom when new message
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, isBotTyping]);

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (trimmedInput) {
      addMessage({ text: trimmedInput, sender: "user" });
      setInput("");
      setIsBotTyping(true);

      try {
        const history = messages.map((msg) => ({
          role: msg.sender === "user" ? "user" : "model",
          parts: [{ text: msg.text }],
        }));

        const response = await axios.post(`${backendUrl}/api/chatbot/chatbot`, {
          message: trimmedInput,
          history,
        });

        addMessage({ text: response.data.reply, sender: "bot" });
      } catch (error) {
        addMessage({
          text: "Error: Could not connect to the chatbot.",
          sender: "bot",
        });
      } finally {
        setIsBotTyping(false);
      }
    }
  };

  // Renders messages and attaches onClick to specialties
  const renderMessage = useCallback(
    (msg) => {
      // Split text by specialties so we can inject clickable spans
      let parts = [msg.text];
      SPECIALTIES.forEach((specialty) => {
        parts = parts.flatMap((part) =>
          typeof part === "string"
            ? part.split(specialty).reduce((acc, curr, i, arr) => {
                if (i < arr.length - 1) {
                  // Before, clickable, after
                  return [
                    ...acc,
                    curr,
                    { type: "specialty", label: specialty },
                  ];
                }
                return [...acc, curr];
              }, [])
            : [part]
        );
      });

      return (
        <span className="leading-relaxed text-sm">
            
          {parts.map((part, i) => {
            if (typeof part === "string") {
              // Format line breaks and styling as before
              let formatted = part
                .replace(/\n\n/g, "\x01") // temp marker for double line break
                .replace(/\n/g, "<br/>")
                .replace(/\x01/g, "<br/><br/>")
                .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                .replace(/\*(.*?)\*/g, "<em>$1</em>")
                .replace(/- (.*?)(<br\/>|$)/g, "• $1<br/>")
                .replace(/### (.+?)\n/g, "<h3>$1</h3>");
              return (
                <span key={i} dangerouslySetInnerHTML={{ __html: formatted }} />
              );
            }
            if (part.type === "specialty") {
              return (
                <span
                  key={i}
                  onClick={() =>
                    navigate(`/doctors/${encodeURIComponent(part.label)}`)
                  }
                  className="text-blue-600 underline hover:text-blue-800 font-medium cursor-pointer"
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      navigate(`/doctors/${encodeURIComponent(part.label)}`);
                    }
                  }}
                >
                  {part.label}
                </span>
              );
            }
            return null;
          })}
        </span>
      );
    },
    [navigate]
  );

  return (
    <div className="fixed bottom-20 right-5 w-80 h-96 bg-white rounded-xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-fuchsia-600 text-white p-3 rounded-t-xl">
        <h3 className="font-semibold text-lg">Chat with us!</h3>
      </div>

      {/* Chat Area */}
      <div
        className="flex-1 p-4 overflow-y-auto flex flex-col space-y-3"
        ref={chatRef}
      >
        <div>Hi there! How can I help you today? Type a message to begin!</div>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg max-w-xs ${
              msg.sender === "user"
                ? "bg-fuchsia-600 text-white self-end rounded-br-none"
                : "bg-gray-100 text-gray-800 self-start rounded-bl-none border border-gray-200"
            }`}
            style={{ wordWrap: "break-word" }}
          >
            {renderMessage(msg)}
          </div>
        ))}
        {isBotTyping && (
          <div className="p-3 rounded-lg bg-gray-100 self-start text-sm text-gray-800 italic max-w-xs border border-gray-200 animate-pulse">
            Bot is typing...
          </div>
        )}
      </div>
      {/* Input Area */}
      <div className="p-3 border-t flex items-center bg-white rounded-b-xl">
        <input
          type="text"
          className="flex-1 border rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          className="ml-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white px-3 py-2 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-md text-xs font-semibold"
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
