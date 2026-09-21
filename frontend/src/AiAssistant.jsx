import React, { useState, useRef, useEffect } from "react";

const AiAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm BioMonitor AI, your medical assistant. Ask me about symptoms, medicine, or upload an image for analysis.",
      isBot: true,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) {
      return;
    }

    var userText = input.trim();
    setInput("");
    setIsLoading(true);

    var newUserMessage = {
      id: Date.now(),
      text: userText,
      isBot: false,
    };
    setMessages(function (prev) {
      return prev.concat([newUserMessage]);
    });

    try {
      var response = await fetch("http://127.0.0.1:8001/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userText }),
      });

      if (!response.ok) {
        throw new Error("Server error: " + response.status);
      }

      var data = await response.json();

      var botReply = "Sorry, I could not process your request.";
      if (data && data.response) {
        botReply = data.response;
      } else if (data && data.error) {
        botReply = "Error: " + data.error;
      }

      var botMessage = {
        id: Date.now() + 1,
        text: botReply,
        isBot: true,
      };
      setMessages(function (prev) {
        return prev.concat([botMessage]);
      });
    } catch (err) {
      var errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting to the server. Please try again later.",
        isBot: true,
      };
      setMessages(function (prev) {
        return prev.concat([errorMessage]);
      });
    } finally {
      setIsLoading(false);
    }
  };

  var handleKeyPress = function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  var handleInputChange = function (e) {
    setInput(e.target.value);
  };

  return (
    <div className="ai-assistant-container">
      <div className="page-hero ai-hero">
        <div className="hero-content">
          <div className="hero-icon-box">&#x1F916;</div>
          <div>
            <h1>AI Medical Assistant</h1>
            <p>Chat, diagnose symptoms, and analyze medical images with AI</p>
          </div>
        </div>
      </div>

      <div className="ai-chat-wrapper">
        <div className="ai-header">
          <div className="ai-avatar">&#x1F916;</div>
          <div className="ai-info">
            <h3>BioMonitor AI</h3>
            <span className="status online">Online - Powered by Gemini</span>
          </div>
        </div>

        <div className="ai-messages">
          {messages.map(function (message) {
            var isBot = message.isBot;
            var msgClass = isBot ? "bot-message" : "user-message";
            var avatarEmoji = isBot ? "\uD83E\uDD16" : "\uD83D\uDC68\u200D\u2695\uFE0F";

            return (
              <div key={message.id} className={"message " + msgClass}>
                {isBot && (
                  <div className="bot-avatar">{avatarEmoji}</div>
                )}
                <div className="message-content">
                  <p>{message.text}</p>
                </div>
                {!isBot && (
                  <div className="user-avatar">{avatarEmoji}</div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="message bot-message">
              <div className="bot-avatar">&#x1F916;</div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef}></div>
        </div>

        <div className="ai-input-container">
          <div className="input-wrapper">
            <textarea
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Ask about symptoms, medicine, or upload an image..."
              disabled={isLoading}
            ></textarea>
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="send-button"
            >
              Send &#x27A1;
            </button>
          </div>
        </div>

        <div className="ai-disclaimer">
          AI guidance is for informational purposes only. Always consult a qualified doctor for final diagnosis.
        </div>
      </div>
    </div>
  );
};

export default AiAssistant;