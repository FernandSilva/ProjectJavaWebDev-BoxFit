import { useState } from 'react';
import { callOpenAI } from '@/lib/openaiService'; // Adjust path as needed

const Chatbot = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleInputChange = (e: any) => setInput(e.target.value);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { role: "user", content: input };
    setMessages([...messages, userMessage]);

    try {
      const response = await callOpenAI(input);
      const botMessage = { role: "bot", content: response.choices[0].text };
      setMessages((prev) => [...prev, userMessage, botMessage]);
    } catch (error) {
      const errorMessage = {
        role: "bot",
        content: "Error communicating with the chat service.",
      };
      setMessages((prev) => [...prev, userMessage, errorMessage]);
    }

    setInput("");
  };

  return (
    <div className={`chatbot-container ${isOpen ? "open" : ""}`}>
      <div className="chatbot-trigger" onClick={toggleChat}>
        <img src="/assets/icons/GrowB.jpeg" alt="Chatbot" style={{ width: "50px", height: "50px" }} />
      </div>
      <div className="chatbox">
        <div className="flex justify-between p-2 border-b border-solid">
          <p className="text-sm font-semibold">GrowBuddy Assistant</p>
          <button onClick={() => setIsOpen(false)}>Close</button>
        </div>
        <div className="messages">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.role}`}>
              <span>{message.content}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center py-3 border-t border-solid bg-white gap-2 px-2">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask me anything..."
            className="border py-1 pl-2 rounded w-full"
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;


